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
