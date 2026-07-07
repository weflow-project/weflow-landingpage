"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // 홈에서 로고 클릭 시 이동 대신 맨 위로 부드럽게 스크롤
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "relative",
        zIndex: 100,
        background: "transparent",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          onClick={handleLogoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <Image
            src="/logo.png"
            alt="WEFLOW"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          <span
            className="title-3 emphasized c-accent"
            style={{ letterSpacing: "-0.02em" }}
          >
            WEFLOW
          </span>
        </Link>
      </div>
    </header>
  );
}
