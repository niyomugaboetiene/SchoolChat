
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiMessageCircle } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <FiMessageCircle size={19} />
              </span>
              SchoolChat
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              A place for students and communities to connect, communicate, and share ideas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <Link to="/dashboard" className="transition hover:text-indigo-600">
              Dashboard
            </Link>
            <Link to="/chat" className="transition hover:text-indigo-600">
              Chat
            </Link>
            <Link to="/about" className="transition hover:text-indigo-600">
              About us
            </Link>
            <a
              href="https://niyomugaboetiene.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-indigo-600"
            >
              Developer portfolio <FiArrowUpRight size={15} />
            </a>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SchoolChat. All rights reserved.</p>
          <p>
            Created by{" "}
            <a
              href="https://niyomugaboetiene.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-700 transition hover:text-indigo-600"
            >
              NIYOMUGABO Etiene
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
