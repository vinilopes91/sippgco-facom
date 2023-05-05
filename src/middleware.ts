import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname === "/cadastro") {
        return true;
      }
      if (req.nextUrl.pathname.startsWith("/secretario")) {
        return token?.role === Role.ADMIN;
      }
      if (req.nextUrl.pathname.startsWith("/candidato")) {
        return token?.role === Role.APPLICANT;
      }
      return !!token;
    },
  },
  pages: {
    signIn: "/",
    newUser: "/cadastro",
  },
});

export const config = {
  matcher: ["/candidato/:path*", "/secretario/:path*"],
};
