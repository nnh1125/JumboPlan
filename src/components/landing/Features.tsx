const features = [
  {
    title: "Track Progress",
    description: "Mark courses as completed and see your degree progress at a glance.",
  },
  {
    title: "Visualize Your Path",
    description: "View your 4-year plan with courses organized by year and semester.",
  },
  {
    title: "CS Requirements",
    description: "Stay on top of MNS, HASS, and CE requirements with built-in tracking.",
  },
];

export default function Features() {
  return (
    <section className="py-20">
      <h2 className="Jersey25 text-center text-6xl font-bold text-slate-900 sm:text-3xl">
        Everything you need to plan your degree
      </h2>
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
          >
            <h3 className="Jersey25 text-2xl text-slate-900">{f.title}</h3>
            <p className="WorkSans mt-2 text-slate-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
