import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import MyPageContent from "@/components/MyPageContent";

export default function MyPagePage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background px-4">
      <header className="flex w-full max-w-5xl items-center justify-between py-6">
        <Link href="/" className="text-lg font-extrabold text-foreground">
          yumview
        </Link>
        <AuthButton />
      </header>

      <main className="flex w-full max-w-5xl flex-1 flex-col items-center gap-8 py-10">
        <h1 className="text-2xl font-extrabold text-foreground">맛집 주머니</h1>
        <MyPageContent />
      </main>
    </div>
  );
}
