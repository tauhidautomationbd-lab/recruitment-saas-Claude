// এই ফাইলটা প্রতিটা request-এর আগে চলে — /hr/dashboard বা /admin/dashboard-এ
// কেউ লগইন ছাড়া বা ভুল role নিয়ে ঢুকতে চাইলে আটকে দেয়।

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isHrProtected = path.startsWith("/hr/dashboard");
  const isAdminProtected = path.startsWith("/admin/dashboard");

  if ((isHrProtected || isAdminProtected) && !user) {
    const loginPath = isAdminProtected ? "/admin/login" : "/hr/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (user && (isHrProtected || isAdminProtected)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (isAdminProtected && profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isHrProtected && profile?.role === "super_admin") {
      return NextResponse.redirect(new URL("/hr/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/hr/dashboard/:path*", "/admin/dashboard/:path*"],
};
