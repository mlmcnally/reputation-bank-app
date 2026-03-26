(function () {
  const SUPABASE_URL = "https://nidxvthbowdgdfuopmzk.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZHh2dGhib3dkZ2RmdW9wbXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTYwMjgsImV4cCI6MjA1OTczMjAyOH0.EaRbqF0WYFzYfjL5A6ykQKzHCZzCNPWJINIVwosqYk4";

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase library not loaded before auth.js");
    return;
  }

  window.supabaseClient =
    window.supabaseClient ||
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const sb = window.supabaseClient;

  async function getCurrentUser() {
    const { data, error } = await sb.auth.getUser();
    if (error) {
      console.error("Auth getUser error:", error);
      return null;
    }
    return data?.user || null;
  }

  async function requireUserOrRedirect() {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = "/login.html";
      return null;
    }
    return user;
  }

  async function signOutUser() {
    const { error } = await sb.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      alert("Could not sign out. Please try again.");
      return;
    }
    window.location.href = "/login.html";
  }

  function wireSignOutButton(buttonId = "signOutBtn") {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener("click", async function () {
      await signOutUser();
    });
  }

  function watchAuthState() {
    sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/login.html";
      }
    });
  }

  window.RBAuth = {
    sb,
    getCurrentUser,
    requireUserOrRedirect,
    signOutUser,
    wireSignOutButton,
    watchAuthState,
  };

  window.signOutUser = signOutUser;
})();
