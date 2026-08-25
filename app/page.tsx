import AuthButton from "@/components/AuthButton";
import SearchSection from "@/components/SearchSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background px-4">
      <header className="flex w-full max-w-5xl items-center justify-between py-6">
        <span className="text-lg font-extrabold text-foreground">yumview</span>
        <AuthButton />
      </header>

      <main className="flex w-full max-w-5xl flex-1 flex-col items-center gap-10 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            서울 맛집을 찾아보세요
          </h1>
          <p className="text-base text-foreground-secondary">
            키워드 하나로 서울 곳곳의 맛집을 검색해보세요.
          </p>
        </div>

        <SearchSection />
      </main>
    </div>
  );
}
