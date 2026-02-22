export default function OnboardingLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #E3F1F9 0%, #BAE3FA 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#5B9DB8] border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-[#5C4C4C] text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
