import asyncio
import re
import json
from playwright.async_api import async_playwright

URL = "https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.SSS_BROWSE_CATLG.GBL?pslnkid=TFP_COURSE_CATALOG"

async def main():
    def parse_course(course_id):
        # Example course_id: "CS 001 - Introduction to Computer Science"
        parts = course_id.split(" - ")
        if len(parts) != 2:
            return course_id, "", ""  # fallback if format is unexpected
        subject_num, title = parts
        subject_parts = subject_num.split()
        if len(subject_parts) < 2:
            return course_id, "", ""  # fallback if format is unexpected
        subject = subject_parts[0]
        num = " ".join(subject_parts[1:])
        return f"{subject} {num}", subject, title
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        context = await browser.new_context(
            # Helps with some sites that behave differently for automation
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1400, "height": 900},
            locale="en-US",
        )

        page = await context.new_page()

        # Optional: print where it ends up after redirects
        page.on("response", lambda r: print("RESP", r.status, r.url) if r.url.startswith("https://sis.it.tufts.edu") else None)

        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)

        # PeopleSoft pages often keep loading XHRs; networkidle can be too strict,
        # so do a short extra wait as well.
        await page.wait_for_timeout(3000)

        print("Final URL:", page.url)
        print("Title:", await page.title())

        # click on c
        frame = page.frame(name="TargetContent")
        await frame.locator("#DERIVED_SSS_BCC_SSR_ALPHANUM_C").click()
        # await page.wait_for_timeout(3000)
        await page.wait_for_timeout(5000)

        # click on CS - computer science dropdown
        await frame.locator(
            '[id="DERIVED_SSS_BCC_GROUP_BOX_1$147$$21"]'
        ).click()
        await page.wait_for_timeout(5000)
        
        # locate container table
        cs_table = frame.locator("#COURSE_LIST\\$scroll\\$21")
        second_row = cs_table.locator("tr").nth(1)
        cell = second_row.locator("td").nth(0)
        inner_table = cell.locator("table")
        rows = inner_table.locator("tbody tr")
        count = await rows.count() # count rows
        print("Number of courses:", count)

        # Create hash table for courses:
        courses = {
            'subject': '',
            'title': '',
            'units': '',
            'typically_offered': '',
            'requirements': '',
            'attributes': '',
            'description': '',
            'grading_basis': ''
        }

        # Iterate through rows and click on each course 
        for i in range(1, count):  # skip header row, process all courses
            nested = False
            course_row = rows.nth(i)
            course_link = course_row.locator("td").nth(0).locator("a")
            course_num= await course_link.inner_text()
            print(f"Clicking on course: {course_num}")
            await course_link.click()
            await page.wait_for_timeout(3000)  # wait for details to load

            # Wait for modal frame to appear
            await page.wait_for_selector('[name^="ptModFrame_"]', timeout=15000)
            await page.wait_for_timeout(2000)  # extra wait for modal content to load

            # Extract frame - use last one (most recent modal) when multiple modals exist
            inner_frame = page.frame_locator('iframe[name^="ptModFrame_"] >> nth=-1')

            # Check if course ID is already visible (single session) or need to click a campus link
            course_id_locator = inner_frame.locator("#DERIVED_CRSECAT_DESCR200")
            if await course_id_locator.count() > 0:
                course_id_text = (await course_id_locator.inner_text()).strip()
                if course_id_text:
                    # directly assign course Id
                    course_id = course_id_text
                else:
                    nested = True
                    # need to click session - try flexible link match
                    campus_link = inner_frame.get_by_role("link").filter(has_text=re.compile(r"Medford|Somerville", re.I)).first
                    await campus_link.click(timeout=15000)
                    await page.wait_for_timeout(3000)
                    course_id = await inner_frame.locator("#DERIVED_CRSECAT_DESCR200").inner_text()
            else:
                nested = True
                # click on session to get course id - try flexible link match
                campus_link = inner_frame.get_by_role("link").filter(has_text=re.compile(r"Medford|Somerville", re.I)).first
                await campus_link.click(timeout=15000)
                await page.wait_for_timeout(3000)
                course_id = await inner_frame.locator("#DERIVED_CRSECAT_DESCR200").inner_text()

            id, subject, title = parse_course(course_id)
            print(f"Course ID: {course_id}")

            async def safe_text(locator):
                """Get inner_text if element exists, else empty string."""
                if await locator.count() > 0:
                    return (await locator.inner_text()).strip()
                return ""

            # extract fields (some may be missing for certain courses)
            units = await safe_text(inner_frame.locator("#DERIVED_CRSECAT_UNITS_RANGE\\$0"))
            typically_offered = await safe_text(inner_frame.locator("#DERIVED_CRSECAT_SSR_TYP_OFFERED\\$0"))
            requirements = await safe_text(inner_frame.locator("#DERIVED_CRSECAT_DESCR254A\\$0"))
            attributes = await safe_text(inner_frame.locator("#DERIVED_CRSECAT_SSR_CRSE_ATTR_LONG\\$0"))
            grading_basis = await safe_text(inner_frame.locator("#SSR_CRSE_OFF_VW_GRADING_BASIS\\$0"))
            description = await safe_text(inner_frame.locator("#SSR_CRSE_OFF_VW_DESCRLONG\\$0"))

            print(f"Units: {units}")
            print(f"Typically Offered: {typically_offered}")
            print(f"Requirements: {requirements}")
            # print(f"Attributes: {attribute}")
            print(f"Grading Basis: {grading_basis}")
            print(f"Description: {description}")

            # attributes = attribute.split(", ") if attribute else []
            # await page.screenshot(path=f"sis_catalog_{course_num}.png", full_page=True)

            courses[id] = {
                'subject': subject,
                'title': title,
                'units': units,
                'typically_offered': typically_offered,
                'requirements': requirements,
                'attributes': attributes,
                'description': description,
                'grading_basis': grading_basis
            }

            # close details and go back to course list
            # Multi-offering: "Return to Select Course Offering" -> offering list, then "Return to Browse Catalog" -> catalog
            # Single offering: "Return to Browse Catalog" (or similar) -> catalog
            back_pattern = re.compile(
                r"return to select course offering|return to .* catalog|browse catalog|course catalog|Medford|Somerville",
                re.I
            )
            try:
                # First click: from course detail to offering list (multi) or to catalog (single)
                back_link = inner_frame.get_by_role("link").filter(has_text=back_pattern).first
                await back_link.click(timeout=15000)
                await page.wait_for_timeout(1500)
                # Second click: from offering list to catalog (only needed for multi-offering)
                inner_frame = page.frame_locator('iframe[name^="ptModFrame_"] >> nth=-1')
                back_link = inner_frame.get_by_role("link").filter(has_text=back_pattern).first
                await back_link.click(timeout=8000)
            except Exception:
                # Fallback: use JS click (bypasses visibility) or Escape key
                close_btn = page.locator('#ptpopupclose').last
                if await close_btn.count() > 0:
                    await close_btn.evaluate("el => el.click()")
                else:
                    await page.keyboard.press("Escape")
            await page.wait_for_timeout(2000)


        # Open a json file to write to 
        with open("cs_courses.json", "w") as f:
            json.dump(courses, f, indent=2)
        

        # await page.screenshot(path="sis_catalog.png", full_page=True)
        await browser.close()

asyncio.run(main())