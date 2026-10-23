let currentScreen = "lobby";
const labels = { lobby: "Lobby", sanctuary: "Sanctuary" };
document.querySelectorAll("[data-screen]").forEach(button => {
  button.addEventListener("click", () => {
    currentScreen = button.dataset.screen;
    document.querySelectorAll("[data-screen]").forEach(b => b.classList.toggle("active", b === button));
    document.querySelector("#selected").textContent = `Editing: ${labels[currentScreen]}`;
  });
});
document.querySelector("#saveTicker").addEventListener("click", () => {
  alert(`Demo only. Announcement for ${labels[currentScreen]} is not saved remotely yet. Connect Supabase before use.`);
});

async function testSupabaseConnection() {
  const status = document.createElement("p");
  status.id = "supabase-status";
  status.textContent = "Connecting to Supabase...";

  document.body.prepend(status);

  try {
    const client = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );

    const { data, error } = await client
      .from("screens")
      .select("*");

    if (error) throw error;

    status.textContent =
      `Supabase connected! Found ${data.length} screens.`;
  } catch (error) {
    console.error("Supabase connection error:", error);
    status.textContent =
      "Connection failed. Check the browser console for details.";
  }
}

testSupabaseConnection();
