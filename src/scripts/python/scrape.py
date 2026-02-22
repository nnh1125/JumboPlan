import asyncio
from os import name
from pdfplumber import page
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
        for i in range(1, 3):  # skip header row
            nested = False
            course_row = rows.nth(i)
            course_link = course_row.locator("td").nth(0).locator("a")
            course_num= await course_link.inner_text()
            print(f"Clicking on course: {course_num}")
            await course_link.click()
            await page.wait_for_timeout(3000)  # wait for details to load

            # Extract frame
            inner_frame = page.frame_locator('[name^="ptModFrame_"]')

            # check if need to click another session 
            if await inner_frame.locator("#DERIVED_CRSECAT_DESCR200").count() > 0:
                # directly assign course Id
                course_id = await inner_frame.locator("#DERIVED_CRSECAT_DESCR200").inner_text()
            else:
                nested = True
                # click on session to get course id
                await inner_frame.get_by_role("link", name="Medford/Somerville Campus").click()
                await page.wait_for_timeout(3000)
                course_id = await inner_frame.locator("#DERIVED_CRSECAT_DESCR200").inner_text()

            id, subject, title = parse_course(course_id)
            print(f"Course ID: {course_id}")

            # extract units
            units = await inner_frame.locator("#DERIVED_CRSECAT_UNITS_RANGE\\$0").inner_text()

            # extract typically offered
            typically_offered = await inner_frame.locator("#DERIVED_CRSECAT_SSR_TYP_OFFERED\\$0").inner_text()

            # extract requirements
            requirements = await inner_frame.locator('#DERIVED_CRSECAT_DESCR254A\\$0').inner_text()
            
            # extract attribute (safe: no timeout if missing)
            attribute_locator = inner_frame.locator(
                "#DERIVED_CRSECAT_SSR_CRSE_ATTR_LONG\\$0"
            )

            if await attribute_locator.count() > 0:
                attributes = (await attribute_locator.inner_text()).strip()
            else:
                attributes = ""

            # grading_basis
            grading_basis = await inner_frame.locator("#SSR_CRSE_OFF_VW_GRADING_BASIS\\$0").inner_text()

            # extract description
            description = await inner_frame.locator("#SSR_CRSE_OFF_VW_DESCRLONG\\$0").inner_text()

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
            if nested:
                await inner_frame.get_by_role("link", name="Medford/Somerville Campus").click()
                await inner_frame.get_by_role("link", name="Medford/Somerville Campus").click()
                nested = False
            else:
                print("Closing course details")
                await inner_frame.get_by_role("link", name="Medford/Somerville Campus").click()
            await page.wait_for_timeout(2000)


        # Open a json file to write to 
        with open("cs_courses.json", "w") as f:
            json.dump(courses, f, indent=2)
        

        # await page.screenshot(path="sis_catalog.png", full_page=True)
        await browser.close()

asyncio.run(main())