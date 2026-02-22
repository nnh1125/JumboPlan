import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between py-6">
      <div className="flex items-center gap-2">
        <svg width="50" height="50" viewBox="0 0 270 270" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M112.5 233.741C102.71 231.511 93.3076 227.837 84.5995 222.84M157.5 36.2588C179.866 41.3671 199.836 53.9178 214.139 71.8561C228.443 89.7944 236.232 112.057 236.232 135C236.232 157.943 228.443 180.206 214.139 198.144C199.836 216.082 179.866 228.633 157.5 233.741M51.5133 192.296C45.3831 183.377 40.7227 173.532 37.7095 163.136M35.1445 118.125C36.9445 107.438 40.4095 97.3125 45.2695 88.0313L47.1708 84.6M77.7033 51.5138C88.2355 44.2787 100.042 39.1026 112.5 36.2588" stroke="#B7D3E3" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M180.25 68.25L180.25 75.75L172.75 75.75L172.75 68.25L180.25 68.25Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M180.25 75.75L180.25 83.25L172.75 83.25L172.75 75.75L180.25 75.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M180.25 60.75L180.25 68.25L172.75 68.25L172.75 60.75L180.25 60.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M172.75 60.75L172.75 68.25L165.25 68.25L165.25 60.75L172.75 60.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M165.25 60.75L165.25 68.25L157.75 68.25L157.75 60.75L165.25 60.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M140 212H146V218H140V212ZM152 200H158V206H152V200ZM152 206H158V212H152V206ZM146 206H152V212H146V206ZM140 206H146V212H140V206Z" fill="#82CDEA"/>
          <path d="M140 212H146M140 212V218H146V212M140 212V206H146M146 212H152M146 212V206M158 206V200H152V206M158 206H152M158 206V212H152M152 206V212M152 206H146" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"/>
          <path d="M52 144H58V150H52V144ZM58 144H64V150H58V144ZM46 144H52V150H46V144ZM52 150H58V156H52V150ZM52 138H58V144H52V138Z" fill="#EEBE4F"/>
          <path d="M52 144H58M52 144V150M52 144H46V150H52M52 144V138H58V144M58 144V150M58 144H64V150H58M58 150H52M58 150V156H52V150" stroke="#5C4C4C" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M115 190H145V160H155V190H185V120H175V180H165V150H135V180H125V150H115V190ZM85 180H105V160H95V170H85V180ZM75 170H85V110H75V170ZM95 150H115V140H95V150ZM95 130H105V120H95V130ZM85 110H95V100H85V110ZM105 110H115V90H95V100H105V110ZM115 130H135V120H125V110H115V130ZM145 100H135V120H175V110H145V100ZM145 100H155V80H115V90H145V100Z" fill="#5C4C4C"/>
        </svg>
        <Link href="/"className="Jersey25 text-xl font-semibold text-slate-900">
        JumboPlan
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link
          href="/sign-in"
          className="WorkSans text-slate-600 hover:text-slate-900 font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="WorkSans rounded-full bg-[#5E94CE] px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
