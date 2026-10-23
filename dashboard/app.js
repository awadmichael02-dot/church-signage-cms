
let currentScreen = "lobby";
let supabaseClient;
let screens = [];

const selectedLabel = document.querySelector("#selected");
const tickerInput = document.querySelector("#ticker");
const saveButton = document.querySelector("#saveTicker");

function screenLabel(id) {
  return screens.find(screen => screen.id === id)?.name
    || (id === "lobby" ? "Lobby" : "Sanctuary");
}

function setStatus(message, isError = false) {
  let status = document.querySelector("#supabase-status");

  if (!status) {
    status = document.createElement("p");
    status.id = "supabase-status";
    document.body.prepend(status);
  }

  status.textContent = message;
  status.style.color = isError ? "crimson" : "green";
}

function updateSelectedLabel() {
  selectedLabel.textContent = `Editing: ${screenLabel(currentScreen)}`;

  document.querySelectorAll("[data-screen]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.screen === currentScreen
    );

    const screen = screens.find(
      item => item.id === button.dataset.screen
    );

    if (screen) {
      button.textContent = screen.name;
    }
  });

  const selected = screens.find(
    screen => screen.id === currentScreen
  );

  if (tickerInput && selected) {
    tickerInput.value = selected.ticker || "";
  }
}

async function loadScreens() {
  setStatus("Loading screens from Supabase...");

  const { data, error } = await supabaseClient
    .from("screens")
    .select("id, name, ticker, updated_at")
    .order("id");

  if (error) throw error;

  screens = data || [];

  if (!screens.some(screen => screen.id === currentScreen)) {
    currentScreen = screens[0]?.id || "";
  }

  updateSelectedLabel();
  setStatus(`Connected! Loaded ${screens.length} screens.`);
}

document.querySelectorAll("[data-screen]").forEach(button => {
  button.addEventListener("click", () => {
    currentScreen = button.dataset.screen;
    updateSelectedLabel();
  });
});

saveButton.addEventListener("click", async () => {
  if (!supabaseClient || !currentScreen) {
    setStatus("No screen selected.", true);
    return;
  }

  const ticker = tickerInput?.value ?? "";

  saveButton.disabled = true;

  try {
    const { data, error } = await supabaseClient
      .from("screens")
      .update({
        ticker,
        updated_at: new Date().toISOString()
      })
      .eq("id", currentScreen)
      .select("id, name, ticker");

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(
        "No row was updated. Check your Supabase permissions."
      );
    }

    screens = screens.map(screen =>
      screen.id === currentScreen
        ? { ...screen, ...data[0] }
        : screen
    );

    setStatus(`Announcement saved for ${screenLabel(currentScreen)}.`);
  } catch (error) {
    console.error("Save announcement failed:", error);
    setStatus(`Save failed: ${error.message}`, true);
  } finally {
    saveButton.disabled = false;
  }
});

async function startDashboard() {
  try {
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );

    await loadScreens();
  } catch (error) {
    console.error("Supabase error:", error);
    setStatus(`Connection failed: ${error.message}`, true);
  }
}

startDashboard();

const loginForm = document.querySelector("#loginForm");
const signOutButton = document.querySelector("#signOutButton");
const uploadForm = document.querySelector("#uploadForm");
const mediaFile = document.querySelector("#mediaFile");
const mediaPreview = document.querySelector("#mediaPreview");
const mediaStatus = document.querySelector("#mediaStatus");
const mediaLibrary = document.querySelector("#mediaLibrary");
const mediaScreen = document.querySelector("#mediaScreen");
const mediaTitle = document.querySelector("#mediaTitle");
const uploadButton = document.querySelector("#uploadButton");

const EDITOR_UID = "2d133fa0-dcbf-4ea7-99cf-932cfb29bbfc";
let editorUser = null;
let previewUrl = null;

function mediaMessage(message) {
  mediaStatus.textContent = message;
}

function updateMediaControls() {
  const signedIn = Boolean(editorUser);

  uploadForm.hidden = !signedIn;
  signOutButton.hidden = !signedIn;
  loginForm.querySelectorAll("input, button").forEach(control => {
    control.disabled = signedIn;
  });

  if (signedIn) {
    mediaMessage(`Signed in as ${editorUser.email}`);
  } else {
    mediaMessage("Please sign in before uploading.");
  }
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.querySelector("#editorEmail").value.trim();
  const password = document.querySelector("#editorPassword").value;

  mediaMessage("Signing in...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    mediaMessage(`Sign-in failed: ${error.message}`);
    return;
  }

  if (data.user.id !== EDITOR_UID) {
    await supabaseClient.auth.signOut();
    editorUser = null;
    updateMediaControls();
    mediaMessage("This account is not authorized to upload.");
    return;
  }

  editorUser = data.user;
  document.querySelector("#editorPassword").value = "";
  updateMediaControls();
  await loadMediaLibrary();
});

signOutButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    mediaMessage(`Sign-out failed: ${error.message}`);
    return;
  }

  editorUser = null;
  mediaLibrary.replaceChildren();
  updateMediaControls();
});

mediaFile.addEventListener("change", () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  mediaPreview.replaceChildren();

  const file = mediaFile.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type === "video/mp4";

  if (!isImage && !isVideo) {
    mediaFile.value = "";
    mediaMessage("Choose an image or MP4 video.");
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    mediaFile.value = "";
    mediaMessage("The file exceeds the 50 MB upload limit.");
    return;
  }

  previewUrl = URL.createObjectURL(file);

  const preview = document.createElement(isImage ? "img" : "video");
  preview.src = previewUrl;
  preview.style.maxWidth = "100%";
  preview.style.maxHeight = "320px";

  if (isVideo) {
    preview.controls = true;
    preview.muted = true;
  }

  mediaPreview.append(preview);
  mediaMessage(`Selected: ${file.name}`);
});

uploadForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!editorUser || editorUser.id !== EDITOR_UID) {
    mediaMessage("Please sign in with the authorized editor account.");
    return;
  }

  const file = mediaFile.files[0];
  const title = mediaTitle.value.trim();

  if (!file || !title) {
    mediaMessage("Enter a title and choose a file.");
    return;
  }

  const mediaType = file.type.startsWith("image/")
    ? "image"
    : file.type === "video/mp4"
      ? "video"
      : null;

  if (!mediaType) {
    mediaMessage("Only images and MP4 videos are supported.");
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    mediaMessage("The file exceeds the 50 MB upload limit.");
    return;
  }

  uploadButton.disabled = true;
  mediaMessage("Uploading media...");

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${crypto.randomUUID()}-${safeName}`;

    const { data: uploaded, error: uploadError } =
      await supabaseClient.storage
        .from("announcements")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false
        });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseClient.storage
      .from("announcements")
      .getPublicUrl(uploaded.path);

    const screenIds = mediaScreen.value === "both"
      ? ["lobby", "sanctuary"]
      : [mediaScreen.value];

    for (const screenId of screenIds) {
      const { error: insertError } = await supabaseClient
        .from("slides")
        .insert({
          screen_id: screenId,
          image_url: urlData.publicUrl,
          title,
          duration_seconds: mediaType === "image" ? 10 : 0,
          media_type: mediaType,
          enabled: true
        });

      if (insertError) throw insertError;
    }

    mediaMessage("Upload complete! Announcement saved.");
    uploadForm.reset();
    mediaPreview.replaceChildren();

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;

    await loadMediaLibrary();
  } catch (error) {
    console.error("Announcement upload failed:", error);
    mediaMessage(`Upload failed: ${error.message}`);
  } finally {
    uploadButton.disabled = false;
  }
});

async function loadMediaLibrary() {
  if (!editorUser || editorUser.id !== EDITOR_UID) return;

  const { data, error } = await supabaseClient
    .from("slides")
    .select("id, screen_id, image_url, title, media_type, enabled")
    .order("id", { ascending: false });

  if (error) {
    mediaMessage(`Could not load announcements: ${error.message}`);
    return;
  }

  mediaLibrary.replaceChildren();

  for (const slide of data || []) {
    const item = document.createElement("article");
    const heading = document.createElement("h4");
    const description = document.createElement("p");
    const link = document.createElement("a");

    heading.textContent = slide.title;
    description.textContent =
      `${slide.media_type} · ${slide.screen_id} · ` +
      `${slide.enabled ? "Enabled" : "Disabled"}`;

    link.href = slide.image_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open media";

    item.append(heading, description, link);
    mediaLibrary.append(item);
  }

  if (!data?.length) {
    mediaLibrary.textContent = "No announcements uploaded yet.";
  }
}

async function restoreEditorSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    mediaMessage(`Session error: ${error.message}`);
    return;
  }

  const user = data.session?.user;

  if (user?.id === EDITOR_UID) {
    editorUser = user;
    updateMediaControls();
    await loadMediaLibrary();
  } else {
    editorUser = null;
    updateMediaControls();
  }
}

updateMediaControls();

const waitForClient = setInterval(() => {
  if (supabaseClient) {
    clearInterval(waitForClient);
    restoreEditorSession();
  }
}, 200);

