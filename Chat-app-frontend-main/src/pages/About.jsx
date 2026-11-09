
import {
  FiArrowUpRight,
  FiCode,
  FiDatabase,
  FiLayers,
  FiMessageCircle,
  FiServer,
  FiUser,
  FiZap
} from "react-icons/fi";
import Image from "../assets/etiene.JPG";

const technologies = [
  {
    name: "React",
    description: "Building the interactive user interface.",
    icon: FiLayers
  },
  {
    name: "Tailwind CSS",
    description: "Creating responsive layouts and styling.",
    icon: FiCode
  },
  {
    name: "Node.js & Express",
    description: "Handling server-side logic and API requests.",
    icon: FiServer
  },
  {
    name: "MySQL",
    description: "Storing and managing application data.",
    icon: FiDatabase
  },
  {
    name: "Socket.IO",
    description: "Supporting real-time communication.",
    icon: FiZap
  }
];

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
            About SchoolChat
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Bringing students closer through communication.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            SchoolChat is a communication platform designed to make it easier
            for students and communities to connect, exchange messages, and
            share information in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:items-center md:py-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src="/etiene.jpg"
              alt="NIYOMUGABO Etiene"
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <div className="px-3 pb-3 pt-5">
              <h2 className="text-xl font-bold text-slate-900">
                NIYOMUGABO Etiene
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Developer & Creator of SchoolChat
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
            Meet the creator
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Hello, I'm Etiene.
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
            <p>
              I'm NIYOMUGABO Etiene, a student and developer interested in
              software development and technology.
            </p>
            <p>
              I created SchoolChat as a project to bring communication
              features together in one platform while improving my skills
              in frontend and backend development.
            </p>
            <p>
              I enjoy learning, building practical applications, and sharing
              what I discover through technology.
            </p>
          </div>

          <a
            href="https://niyomugaboetiene.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Visit my portfolio <FiArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              Behind the project
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Technologies used
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              SchoolChat brings together several technologies to deliver its
              interface, backend services, data storage, and communication
              features.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((technology) => {
              const Icon = technology.icon;

              return (
                <div
                  key={technology.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">
                    {technology.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {technology.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <FiMessageCircle size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">
                  SchoolChat
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Communication starts with connection.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Thank you for being part of this project.
              </p>
            </div>
            <a
              href="https://niyomugaboetiene.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 sm:self-center"
            >
              More about the developer <FiArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
