export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-3xl">
        <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white">
          Real-Time Collaborative
          <span className="text-purple-500">
            {" "}Code Editor
          </span>
        </h1>

        <p className="text-lg leading-8 text-zinc-400">
          Create coding rooms, collaborate live with friends,
          practice interviews and build projects together in real-time.
        </p>
      </div>
    </section>
  );
}