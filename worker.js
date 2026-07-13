const DEFAULT_JOBS = [
  {
    "id": "1",
    "title": "Anlagenmechaniker SHK / Heizungsbauer / Gas- und Wasserinstallateur (m/w/d)",
    "category": "shk",
    "tags": ["Vollzeit", "Lehrte & Region Hannover", "Ab sofort"],
    "intro": "Egal ob du dich als Anlagenmechaniker SHK, Heizungsbauer oder Gas- und Wasserinstallateur bezeichnest – wenn du dein Handwerk beherrschst, bist du bei uns richtig.",
    "aufgaben": [
      "Du installierst moderne Heizungsanlagen, Wärmepumpen und hochwertige Bäder in der Region Hannover.",
      "Umbau und Sanierung von Bädern",
      "Montage von Rohrleitungssystemen und Komponenten",
      "Selbstständige Abwicklung von Projekten im Team",
      "Dokumentation der ausgeführten Arbeiten"
    ],
    "anforderungen": [
      "Eine Ausbildung als Anlagenmechaniker SHK, Heizungsbauer, Zentralheizungs- und Lüftungsbauer oder Gas- und Wasserinstallateur",
      "Freude am Handwerk und an sauberer Arbeit",
      "Führerschein Klasse B",
      "Zuverlässigkeit und Teamgeist"
    ],
    "vorteile": [
      "Unbefristeter Arbeitsvertrag",
      "Hochwertiges Werkzeug und moderne Arbeitskleidung",
      "Feste Ansprechpartner und kurze Entscheidungswege",
      "Weiterbildungsmöglichkeiten im Bereich Wärmepumpen und moderne Gebäudetechnik",
      "Ein familiäres Team mit rund 30 Kollegen"
    ],
    "active": true
  },
  {
    "id": "2",
    "title": "Kundendiensttechniker SHK (m/w/d)",
    "category": "service",
    "tags": ["Vollzeit", "Privat- & Gewerbekunden", "Ab sofort"],
    "intro": "Du bist der Profi, wenn es um Wartung, Reparatur und Instandhaltung geht? Dann komm in unser Team!",
    "aufgaben": [
      "Wartung und Instandsetzung von Heizungsanlagen (Gas, Öl, Wärmepumpen)",
      "Fehlersuche und Störungsbehebung",
      "Inbetriebnahme von Neuanlagen",
      "Beratung unserer Kunden vor Ort"
    ],
    "anforderungen": [
      "Abgeschlossene Ausbildung im SHK-Bereich",
      "Erfahrung im Kundendienst",
      "Sicherer Umgang mit Mess- und Regeltechnik",
      "Führerschein Klasse B",
      "Kundenorientiertes Auftreten"
    ],
    "vorteile": [
      "Eigenes, voll ausgestattetes Kundendienstfahrzeug",
      "Abwechslungsreiche Aufgaben bei Privat- und Gewerbekunden",
      "Regelmäßige Schulungen direkt bei den Herstellern",
      "Attraktive Vergütung und Notdienst-Zuschläge"
    ],
    "active": true
  },
  {
    "id": "3",
    "title": "Elektroniker für Energie- und Gebäudetechnik (m/w/d)",
    "category": "elektro",
    "tags": ["Vollzeit", "Smart Home & WP-Anbindung", "Ab sofort"],
    "intro": "Wir brauchen deine Power für die elektrische Anbindung unserer Heizsysteme und Smart-Home-Lösungen.",
    "aufgaben": [
      "Elektrischer Anschluss von Heizungsanlagen and Wärmepumpen",
      "Installation von Mess-, Steuer- und Regelungstechnik",
      "Allgemeine Elektroinstallationen im Rahmen von Sanierungen",
      "Fehlersuche in elektrischen Systemen"
    ],
    "anforderungen": [
      "Ausbildung als Elektroniker für Energie- und Gebäudetechnik oder vergleichbar",
      "Interesse an moderner Haustechnik",
      "Selbstständige Arbeitsweise",
      "Führerschein Klasse B"
    ],
    "vorteile": [
      "Spezialisierung auf zukunftssichere Technologien (Wärmepumpen, PV-Anbindung)",
      "Modernste Messgeräte",
      "Sicherer Arbeitsplatz in einem wachsenden Markt"
    ],
    "active": true
  },
  {
    "id": "4",
    "title": "Auszubildende zum Anlagenmechaniker SHK (m/w/d)",
    "category": "azubi",
    "tags": ["Ausbildung", "Zukunftssicher", "Start 2026"],
    "intro": "Starte deine Karriere im Handwerk und werde Experte für Klima und Wasser.",
    "aufgaben": [
      "Wie man moderne Heizsysteme plant und installiert",
      "Die Gestaltung von Wohlfühlbädern",
      "Den Umgang mit nachhaltigen Energien wie Wärmepumpen",
      "Alles über Rohrleitungsbau und Technik"
    ],
    "anforderungen": [
      "Einen guten Haupt- oder Realschulabschluss",
      "Handwerkliches Geschick und technisches Verständnis",
      "Lust, im Team zu arbeiten und anzupacken"
    ],
    "vorteile": [
      "Eine fundierte Ausbildung mit Zukunftsperspektive",
      "Übernahmechance nach erfolgreichem Abschluss",
      "Azubi-Projekte und ein tolles Team",
      "Unterstützung bei der Prüfungsvorbereitung"
    ],
    "active": true
  }
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    // Environment variable 'Passwort' must be set securely in Cloudflare Dashboard -> Pages Settings
    const ADMIN_PASSWORD = env.Passwort;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    function getExtension(filename, mimeType) {
      if (filename && filename.includes('.')) {
        return filename.split('.').pop().toLowerCase();
      }
      if (mimeType) {
        const parts = mimeType.split('/');
        if (parts.length === 2) {
          const ext = parts[1].toLowerCase();
          if (ext === 'jpeg') return 'jpg';
          return ext;
        }
      }
      return 'jpg';
    }

    // --- JOBS API ---

    // Get Jobs list
    if (url.pathname === "/api/jobs" && method === "GET") {
      try {
        const obj = await env.BUCKET.get("weymann-gebaeudetechnik/jobs.json");
        if (!obj) {
          // If not in R2, return DEFAULT_JOBS
          return new Response(JSON.stringify(DEFAULT_JOBS), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const data = await obj.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Save Job (Create, Update, Duplicate)
    if (url.pathname === "/api/jobs/save" && method === "POST") {
      const password = request.headers.get("X-Admin-Password");
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401, headers: corsHeaders });
      }

      try {
        const jobData = await request.json();
        let jobs = [];

        const obj = await env.BUCKET.get("weymann-gebaeudetechnik/jobs.json");
        if (obj) {
          jobs = await obj.json();
        } else {
          jobs = JSON.parse(JSON.stringify(DEFAULT_JOBS));
        }

        let savedId = jobData.id;
        if (savedId) {
          // Update existing
          const idx = jobs.findIndex(j => j.id === savedId);
          if (idx !== -1) {
            jobs[idx] = jobData;
          } else {
            jobs.push(jobData);
          }
        } else {
          // Create new / duplicate
          savedId = Date.now().toString();
          jobData.id = savedId;
          jobs.push(jobData);
        }

        // Save back to R2
        await env.BUCKET.put("weymann-gebaeudetechnik/jobs.json", JSON.stringify(jobs), {
          httpMetadata: { contentType: "application/json" }
        });

        return new Response(JSON.stringify({ success: true, id: savedId }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Delete Job
    if (url.pathname === "/api/jobs/delete" && method === "POST") {
      const password = request.headers.get("X-Admin-Password");
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401, headers: corsHeaders });
      }

      try {
        const { id } = await request.json();
        if (!id) {
          return new Response(JSON.stringify({ error: "ID fehlt" }), { status: 400, headers: corsHeaders });
        }

        let jobs = [];
        const obj = await env.BUCKET.get("weymann-gebaeudetechnik/jobs.json");
        if (obj) {
          jobs = await obj.json();
        } else {
          jobs = JSON.parse(JSON.stringify(DEFAULT_JOBS));
        }

        jobs = jobs.filter(j => j.id !== id);

        await env.BUCKET.put("weymann-gebaeudetechnik/jobs.json", JSON.stringify(jobs), {
          httpMetadata: { contentType: "application/json" }
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- PROJECTS API ---

    if (url.pathname === "/api/test-env" && method === "GET") {
      return new Response(JSON.stringify({
        hasBucket: !!env.BUCKET,
        hasPasswort: !!ADMIN_PASSWORD,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/projects" && method === "GET") {
      try {
        // R2 list with customMetadata has low page limits due to metadata size.
        // We must paginate to get ALL objects.
        let allObjects = [];
        let cursor = undefined;
        let truncated = true;
        while (truncated) {
          const opts = {
            prefix: "weymann-gebaeudetechnik/Gallerie/",
            include: ["customMetadata"],
          };
          if (cursor) opts.cursor = cursor;
          const listed = await env.BUCKET.list(opts);
          allObjects = allObjects.concat(listed.objects);
          truncated = listed.truncated;
          cursor = listed.cursor;
        }
        
        const mainProjects = allObjects.filter(obj => {
          return obj.key.includes("_main.") || (!obj.key.includes("_extra_") && obj.key.includes("projekt_"));
        });

        const sorted = mainProjects.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

        function safeDecode(str) {
          if (!str) return "";
          try {
            return decodeURIComponent(str);
          } catch (e) {
            return str;
          }
        }

        const objects = sorted.map(obj => {
          const meta = obj.customMetadata || {};
          return {
            ...obj,
            customMetadata: {
              ...meta,
              category: safeDecode(meta.category),
              title: safeDecode(meta.title),
              description: safeDecode(meta.description),
              bodyText: safeDecode(meta.bodyText),
              extraImages: meta.extraImages,
            }
          };
        });

        return new Response(JSON.stringify(objects), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/login" && method === "POST") {
      const { password } = await request.json();
      if (password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "Falsches Passwort" }), { status: 401, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/upload" && method === "POST") {
      const password = request.headers.get("X-Admin-Password");
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401, headers: corsHeaders });
      }

      try {
        const formData = await request.formData();
        const file = formData.get("image");
        const category = formData.get("category");
        const title = formData.get("title");
        const description = formData.get("description");
        const bodyText = formData.get("bodyText") || "";
        const extraFiles = formData.getAll("extra_images");

        const imageName = formData.get("image_name") || "";
        const imageType = formData.get("image_type") || "image/jpeg";
        const extraNamesStr = formData.get("extra_images_names") || "";
        const extraTypesStr = formData.get("extra_images_types") || "";
        const extraNames = extraNamesStr ? extraNamesStr.split(",") : [];
        const extraTypes = extraTypesStr ? extraTypesStr.split(",") : [];

        if (!file || !title) {
          return new Response(JSON.stringify({ error: "Bild und Titel sind erforderlich" }), { status: 400, headers: corsHeaders });
        }

        const cleanDescription = (description || "").replace(/\r?\n/g, "\\n");
        const cleanBodyText = (bodyText || "").replace(/\r?\n/g, "\\n");

        const projectId = Date.now();
        
        const extraImageKeys = [];
        for (let i = 0; i < extraFiles.length; i++) {
          const extraFile = extraFiles[i];
          if (extraFile) {
            const extraExt = getExtension(extraNames[i], extraTypes[i]);
            const extraFilename = `weymann-gebaeudetechnik/Gallerie/projekt_${projectId}_extra_${i}.${extraExt}`;
            await env.BUCKET.put(extraFilename, extraFile, {
              httpMetadata: { contentType: extraTypes[i] || "image/jpeg" }
            });
            extraImageKeys.push(extraFilename);
          }
        }

        const ext = getExtension(imageName, imageType);
        const filename = `weymann-gebaeudetechnik/Gallerie/projekt_${projectId}_main.${ext}`;

        const customMetadata = {
          category: encodeURIComponent(category || "Projekt"),
          title: encodeURIComponent(title || "Neues Projekt"),
          description: encodeURIComponent(cleanDescription),
          bodyText: encodeURIComponent(cleanBodyText),
        };
        
        if (extraImageKeys.length > 0) {
          customMetadata.extraImages = extraImageKeys.join(",");
        }

        await env.BUCKET.put(filename, file, {
          httpMetadata: { contentType: imageType },
          customMetadata: customMetadata,
        });

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/delete" && method === "POST") {
      const password = request.headers.get("X-Admin-Password");
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401, headers: corsHeaders });
      }

      try {
        const { key } = await request.json();
        if (!key) throw new Error("Key fehlt");
        
        const obj = await env.BUCKET.head(key);
        if (obj && obj.customMetadata && obj.customMetadata.extraImages) {
          const extraKeys = obj.customMetadata.extraImages.split(",");
          for (const extraKey of extraKeys) {
            await env.BUCKET.delete(extraKey.trim());
          }
        }
        
        await env.BUCKET.delete(key);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/update" && method === "POST") {
      const password = request.headers.get("X-Admin-Password");
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401, headers: corsHeaders });
      }

      try {
        const formData = await request.formData();
        const key = formData.get("key");
        const category = formData.get("category");
        const title = formData.get("title");
        const description = formData.get("description");
        const bodyText = formData.get("bodyText") || "";
        const deletedExtraImagesStr = formData.get("deleted_extra_images") || "";
        const file = formData.get("image");
        const newExtraFiles = formData.getAll("extra_images");

        const imageName = formData.get("image_name") || "";
        const imageType = formData.get("image_type") || "image/jpeg";
        const extraNamesStr = formData.get("extra_images_names") || "";
        const extraTypesStr = formData.get("extra_images_types") || "";
        const extraNames = extraNamesStr ? extraNamesStr.split(",") : [];
        const extraTypes = extraTypesStr ? extraTypesStr.split(",") : [];

        if (!key) {
          return new Response(JSON.stringify({ error: "Projekt-Schlüssel fehlt" }), { status: 400, headers: corsHeaders });
        }

        const obj = await env.BUCKET.get(key);
        if (!obj) {
          return new Response(JSON.stringify({ error: "Projekt nicht gefunden" }), { status: 404, headers: corsHeaders });
        }

        const currentMetadata = obj.customMetadata || {};
        let extraImagesList = [];
        if (currentMetadata.extraImages) {
          extraImagesList = currentMetadata.extraImages.split(",").map(k => k.trim()).filter(k => k.length > 0);
        }

        const deletedKeys = deletedExtraImagesStr.split(",").map(k => k.trim()).filter(k => k.length > 0);
        for (const delKey of deletedKeys) {
          try {
            await env.BUCKET.delete(delKey);
          } catch(e) {
            console.error("Failed to delete extra image:", delKey, e.message);
          }
          extraImagesList = extraImagesList.filter(k => k !== delKey);
        }

        const projectId = key.match(/projekt_(\d+)/)?.[1] || Date.now();
        let nextIndex = 0;
        extraImagesList.forEach(k => {
          const match = k.match(/extra_(\d+)/);
          if (match) {
            const idx = parseInt(match[1]);
            if (idx >= nextIndex) nextIndex = idx + 1;
          }
        });

        for (let i = 0; i < newExtraFiles.length; i++) {
          const extraFile = newExtraFiles[i];
          if (extraFile) {
            const extraExt = getExtension(extraNames[i], extraTypes[i]);
            const extraFilename = `weymann-gebaeudetechnik/Gallerie/projekt_${projectId}_extra_${nextIndex + i}.${extraExt}`;
            await env.BUCKET.put(extraFilename, extraFile, {
              httpMetadata: { contentType: extraTypes[i] || "image/jpeg" }
            });
            extraImagesList.push(extraFilename);
          }
        }

        const cleanDescription = (description || "").replace(/\r?\n/g, "\\n");
        const cleanBodyText = (bodyText || "").replace(/\r?\n/g, "\\n");

        const customMetadata = {
          category: encodeURIComponent(category || "Projekt"),
          title: encodeURIComponent(title || "Projekt"),
          description: encodeURIComponent(cleanDescription),
          bodyText: encodeURIComponent(cleanBodyText),
        };

        if (extraImagesList.length > 0) {
          customMetadata.extraImages = extraImagesList.join(",");
        }

        if (file && typeof file === "object" && file.size > 0) {
          const newExt = getExtension(imageName, imageType);
          const newKey = `weymann-gebaeudetechnik/Gallerie/projekt_${projectId}_main.${newExt}`;
          
          await env.BUCKET.put(newKey, file, {
            httpMetadata: { contentType: imageType },
            customMetadata: customMetadata,
          });
          
          if (newKey !== key) {
            try {
              await env.BUCKET.delete(key);
            } catch(e) {
              console.error("Failed to delete old main key:", key, e.message);
            }
          }
        } else {
          await env.BUCKET.put(key, obj.body, {
            httpMetadata: { contentType: obj.httpMetadata?.contentType || "image/jpeg" },
            customMetadata: customMetadata,
          });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- ADMIN PAGE UI ---
    if (url.pathname === "/admin") {
      const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weymann Admin Dashboard</title>
    <style>
        :root { --primary: #0d2b5e; --secondary: #d21e26; --bg: #f4f7f6; --text: #333; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: var(--bg); color: var(--text); padding: 2rem; display: flex; justify-content: center; min-height: 100vh; }
        .container { max-width: 900px; width: 100%; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { color: var(--primary); margin-bottom: 1.5rem; text-align: center; }
        
        /* Tab Styles */
        .tabs-header { display: flex; gap: 1rem; border-bottom: 2px solid #eee; margin-bottom: 2rem; }
        .tab-btn { background: transparent; color: #666; border: none; font-weight: 600; padding: 0.75rem 1.25rem; font-size: 1rem; border-bottom: 3px solid transparent; cursor: pointer; transition: 0.2s; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 700; }
        
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #555; }
        input, textarea, select { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; font-family: inherit; background-color: white; }
        select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
        textarea { resize: vertical; min-height: 100px; }
        button { width: 100%; padding: 1rem; background: var(--primary); color: white; border: none; border-radius: 6px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: 0.3s; }
        button:hover { background: var(--secondary); }
        .hidden { display: none !important; }
        .alert { padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; }
        .alert-error { background: #ffebee; color: #c62828; }
        .alert-success { background: #e8f5e9; color: #2e7d32; }
        
        .list-section { margin-top: 3rem; border-top: 2px solid #eee; padding-top: 2rem; }
        .list-section h2 { margin-bottom: 1.5rem; color: var(--primary); }
        .list-item { display: flex; gap: 1rem; background: #f9f9f9; padding: 1.25rem; border-radius: 8px; margin-bottom: 1rem; align-items: center; border: 1px solid #eee; }
        .list-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
        .item-info { flex: 1; }
        .item-info h4 { margin-bottom: 0.3rem; color: var(--primary); font-size: 1.1rem; }
        .item-info small { color: #666; font-size: 0.85rem; font-weight: 500; background: #eef1f5; padding: 0.25rem 0.6rem; border-radius: 50px; }
        .item-info .item-tags { margin-top: 0.5rem; display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .item-info .item-tag { font-size: 0.75rem; background: #ffebee; color: var(--secondary); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600; }
        
        .btn-action-group { display: flex; gap: 0.5rem; }
        .btn-edit { background: #e8f5e9; color: #2e7d32; width: auto; padding: 0.5rem 1rem; font-size: 0.9rem; border: none; border-radius: 6px; cursor: pointer; transition: 0.3s; }
        .btn-edit:hover { background: #2e7d32; color: white; }
        .btn-dup { background: #e3f2fd; color: #1565c0; width: auto; padding: 0.5rem 1rem; font-size: 0.9rem; border: none; border-radius: 6px; cursor: pointer; transition: 0.3s; }
        .btn-dup:hover { background: #1565c0; color: white; }
        .btn-delete { background: #ffebee; color: #c62828; width: auto; padding: 0.5rem 1rem; font-size: 0.9rem; border: none; border-radius: 6px; cursor: pointer; transition: 0.3s; }
        .btn-delete:hover { background: #ef5350; color: white; }
        
        .image-preview-box { margin-top: 0.5rem; }
        .extra-images-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .extra-preview-item { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid #ddd; }
        .extra-preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .extra-preview-item .delete-badge { position: absolute; top: 2px; right: 2px; background: rgba(210, 30, 38, 0.9); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; cursor: pointer; border: none; line-height: 1; }
        
        .form-buttons { display: flex; gap: 1rem; margin-top: 2rem; }
        .btn-cancel { background: #eee !important; color: #333 !important; }
        .btn-cancel:hover { background: #ddd !important; }
        
        .rich-editor {
            width: 100%;
            min-height: 220px;
            padding: 1.2rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            line-height: 1.7;
            font-family: inherit;
            background-color: white;
            color: var(--text);
            outline: none;
            overflow-y: auto;
        }
        .rich-editor:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(13, 43, 94, 0.1); }
        .rich-editor:empty::before { content: attr(placeholder); color: #999; font-style: italic; display: block; }
        .rich-editor h3.project-details-heading { font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .rich-editor h4.project-details-heading { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-top: 1.25rem; margin-bottom: 0.4rem; }
        .rich-editor ul.project-details-list { margin-bottom: 1.25rem; padding-left: 1.2rem; list-style: none; }
        .rich-editor ul.project-details-list li { position: relative; margin-bottom: 0.4rem; padding-left: 1rem; }
        .rich-editor ul.project-details-list li::before { content: ''; position: absolute; left: 0; top: 0.55rem; width: 6px; height: 6px; background-color: var(--secondary); border-radius: 50%; }
        .rich-editor p { margin-bottom: 1rem; }
    </style>
</head>
<body>

    <div class="container" id="login-container">
        <h1>Admin Login</h1>
        <div id="login-error" class="alert alert-error hidden"></div>
        <form id="login-form">
            <div class="form-group">
                <label>Passwort</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Einloggen</button>
        </form>
    </div>

    <div class="container hidden" id="dashboard-container">
        <!-- Tabs -->
        <div class="tabs-header">
            <button type="button" class="tab-btn active" id="tab-projects" onclick="switchTab('projects')">Projekte verwalten</button>
            <button type="button" class="tab-btn" id="tab-jobs" onclick="switchTab('jobs')">Stellenanzeigen verwalten</button>
        </div>

        <div id="status-alert" class="alert hidden"></div>

        <!-- Tab 1: PROJECTS SECTION -->
        <div id="section-projects">
            <h2 id="project-form-title" style="margin-bottom: 1.5rem; color: var(--primary);">Neues Projekt hochladen</h2>
            <form id="project-form">
                <div class="form-group">
                    <label>Kategorie</label>
                    <select id="project-category" required onchange="toggleProjectCategoryField()">
                        <option value="" disabled selected>Bitte wählen...</option>
                        <option value="Wärmepumpen">Wärmepumpen</option>
                        <option value="Heizung & Solar">Heizung & Solar</option>
                        <option value="Badsanierung">Badsanierung</option>
                        <option value="Klima & Lüftung">Klima & Lüftung</option>
                        <option value="Wartung & Service">Wartung & Service</option>
                        <option value="custom">+ Neue Kategorie erstellen...</option>
                    </select>
                </div>
                <div class="form-group hidden" id="project-custom-category-group">
                    <label>Name der neuen Kategorie</label>
                    <input type="text" id="project-custom-category-name" placeholder="z.B. Photovoltaik">
                </div>
                <div class="form-group">
                    <label>Titel des Projekts</label>
                    <input type="text" id="project-title" required placeholder="Einbau Wärmepumpe">
                </div>
                <div class="form-group">
                    <label>Beschreibungstext (Kurzinfo für die Kachel)</label>
                    <textarea id="project-description" required placeholder="Kurze Beschreibung..."></textarea>
                </div>
                <div class="form-group">
                    <label>Fließtext (Ausführliche Projektvorstellung)</label>
                    <div id="project-bodyText" contenteditable="true" class="rich-editor" placeholder="Detaillierter Fließtext über das Projekt..."></div>
                </div>
                <div class="form-group">
                    <label>Haupt-Projektbild</label>
                    <span style="font-size: 0.8rem; color: #666; display: block; margin-bottom: 0.5rem;">JPG, JPEG, PNG, WEBP</span>
                    <input type="file" id="project-image" accept="image/jpeg,image/png,image/webp" required>
                    <div id="project-main-preview" class="image-preview-box hidden">
                        <img id="project-preview-img" src="" style="max-height: 120px; border-radius: 6px; display: block; border: 1px solid #ddd; padding: 4px;">
                        <span style="font-size: 0.85rem; color:#666; margin-top:0.25rem; display:block;">(Leer lassen, um das bestehende Bild zu behalten)</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Weitere Bilder (Optional)</label>
                    <input type="file" id="project-extra-images" accept="image/jpeg,image/png,image/webp" multiple>
                    <div id="project-existing-extras" class="extra-images-grid hidden"></div>
                    <div id="project-new-extras" class="extra-images-grid hidden"></div>
                </div>
                <div class="form-buttons">
                    <button type="submit" id="project-submit-btn">Hochladen & Veröffentlichen</button>
                    <button type="button" id="project-cancel-btn" class="btn btn-cancel hidden" onclick="resetProjectForm()">Abbrechen</button>
                </div>
            </form>

            <div class="list-section">
                <h2>Aktuelle Projekte</h2>
                <div id="projects-list-wrapper">Lade Projekte...</div>
            </div>
        </div>

        <!-- Tab 2: JOBS SECTION -->
        <div id="section-jobs" class="hidden">
            <h2 id="job-form-title" style="margin-bottom: 1.5rem; color: var(--primary);">Neue Stellenanzeige erstellen</h2>
            <form id="job-form">
                <div class="form-group">
                    <label>Kategorie</label>
                    <select id="job-category" required onchange="toggleCustomCategoryField()">
                        <option value="" disabled selected>Bitte wählen...</option>
                        <option value="shk">Anlagenmechaniker SHK (shk)</option>
                        <option value="service">Kundendiensttechniker (service)</option>
                        <option value="elektro">Elektroniker (elektro)</option>
                        <option value="azubi">Ausbildung (azubi)</option>
                        <option value="custom">+ Neue Kategorie erstellen...</option>
                    </select>
                </div>
                <div class="form-group hidden" id="custom-category-group">
                    <label>Name der neuen Kategorie</label>
                    <input type="text" id="job-custom-category-name" placeholder="z.B. Büro & Verwaltung">
                </div>
                <div class="form-group">
                    <label>Stellentitel</label>
                    <input type="text" id="job-title" required placeholder="Anlagenmechaniker SHK / Heizungsbauer (m/w/d)">
                </div>
                <div class="form-group">
                    <label>Tags (Kommagetrennt)</label>
                    <input type="text" id="job-tags" required placeholder="Vollzeit, Lehrte, Ab sofort">
                </div>
                <div class="form-group">
                    <label>Einleitungstext</label>
                    <textarea id="job-intro" required placeholder="Starte deine Karriere im Handwerk..."></textarea>
                </div>
                <div class="form-group">
                    <label>Deine Aufgaben (Eine Zeile pro Aufgabe)</label>
                    <textarea id="job-aufgaben" required placeholder="Installation moderner Heizsysteme&#10;Umbau von Bädern"></textarea>
                </div>
                <div class="form-group">
                    <label>Das solltest du mitbringen (Eine Zeile pro Punkt)</label>
                    <textarea id="job-anforderungen" required placeholder="Abgeschlossene Berufsausbildung&#10;Führerschein Klasse B"></textarea>
                </div>
                <div class="form-group">
                    <label>Das erwartet dich / Vorteile (Eine Zeile pro Vorteil)</label>
                    <textarea id="job-vorteile" required placeholder="Attraktive Vergütung&#10;30 Tage Urlaub"></textarea>
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="job-active" style="width: auto;" checked>
                    <label for="job-active" style="margin-bottom: 0; cursor: pointer;">Veröffentlicht (Aktiv)</label>
                </div>
                <div class="form-buttons">
                    <button type="submit" id="job-submit-btn">Stellenanzeige speichern</button>
                    <button type="button" id="job-cancel-btn" class="btn btn-cancel hidden" onclick="resetJobForm()">Abbrechen</button>
                </div>
            </form>

            <div class="list-section">
                <h2>Aktuelle Stellenanzeigen</h2>
                <div id="jobs-list-wrapper">Lade Stellenanzeigen...</div>
            </div>
        </div>
    </div>

    <script>
        window.onerror = function(message, source, lineno, colno, error) {
            const errDiv = document.getElementById("login-error");
            if (errDiv) {
                errDiv.textContent = "JavaScript-Fehler: " + message + " (Zeile " + lineno + ", Spalte " + colno + ")";
                errDiv.classList.remove("hidden");
            }
            return false;
        };

        let savedPassword = localStorage.getItem("weymann_admin_pw");
        let activeTab = "projects";
        
        // Projects state
        let editingProjectKey = null;
        let deletedExtraImages = [];
        let loadedProjectsList = [];
        
        // Jobs state
        let editingJobId = null;
        let loadedJobsList = [];

        const imgProxy = "/img/";

        // Init
        if (savedPassword) {
            verifyPasswordAndShow();
        }

        async function verifyPasswordAndShow() {
            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: savedPassword })
                });
                if (res.ok) {
                    showDashboard();
                } else {
                    localStorage.removeItem("weymann_admin_pw");
                    document.getElementById("login-error").textContent = "Sitzung abgelaufen. Bitte erneut anmelden.";
                    document.getElementById("login-error").classList.remove("hidden");
                }
            } catch (err) {
                document.getElementById("login-error").textContent = "Verbindungsfehler: " + err.message;
                document.getElementById("login-error").classList.remove("hidden");
            }
        }

        document.getElementById("login-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById("login-error");
            errorDiv.classList.add("hidden");
            const pw = document.getElementById("password").value;
            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: pw })
                });
                if (res.ok) {
                    savedPassword = pw;
                    localStorage.setItem("weymann_admin_pw", pw);
                    showDashboard();
                } else {
                    let errMsg = "Falsches Passwort";
                    try {
                        const errJson = await res.json();
                        if (errJson && errJson.error) errMsg += " (" + errJson.error + ")";
                    } catch(err) {}
                    errorDiv.textContent = errMsg;
                    errorDiv.classList.remove("hidden");
                }
            } catch (err) {
                errorDiv.textContent = "Verbindungsfehler: " + err.message;
                errorDiv.classList.remove("hidden");
            }
        });

        function showDashboard() {
            document.getElementById("login-container").classList.add("hidden");
            document.getElementById("dashboard-container").classList.remove("hidden");
            loadProjects();
            loadJobs();
        }

        function switchTab(tab) {
            activeTab = tab;
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            document.getElementById("tab-" + tab).classList.add("active");
            
            if (tab === "projects") {
                document.getElementById("section-projects").classList.remove("hidden");
                document.getElementById("section-jobs").classList.add("hidden");
            } else {
                document.getElementById("section-projects").classList.add("hidden");
                document.getElementById("section-jobs").classList.remove("hidden");
            }
        }

        function showStatus(text, isError = false) {
            const alert = document.getElementById("status-alert");
            alert.textContent = text;
            alert.className = "alert " + (isError ? "alert-error" : "alert-success");
            alert.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => alert.classList.add("hidden"), 5000);
        }

        // --- PROJECTS ADMIN ---

        async function loadProjects() {
            const wrapper = document.getElementById("projects-list-wrapper");
            const res = await fetch("/api/projects");
            if (res.ok) {
                const projects = await res.json();
                loadedProjectsList = projects;
                if (projects.length === 0) {
                    wrapper.innerHTML = "<p>Keine Projekte gefunden.</p>";
                    return;
                }
                wrapper.innerHTML = projects.map(p => {
                    const meta = p.customMetadata || {};
                    const encodedKey = p.key.split('/').map(encodeURIComponent).join('/');
                    const cleanTitle = (meta.title || "Unbenannt").replace(/\\\\n/g, ' ');
                    const cleanCategory = meta.category || "Keine Kategorie";
                    const extraInfo = meta.extraImages ? " | " + meta.extraImages.split(',').length + " extra Bilder" : "";
                    return \`
                        <div class="list-item">
                            <img src="\${imgProxy}\${encodedKey}" alt="\${cleanTitle}">
                            <div class="item-info">
                                <h4>\${cleanTitle}</h4>
                                <small>\${cleanCategory}\${extraInfo}</small>
                            </div>
                            <div class="btn-action-group">
                                <button class="btn-edit" onclick="editProject('\${p.key}')">Bearbeiten</button>
                                <button class="btn-delete" onclick="deleteProject('\${p.key}')">Löschen</button>
                            </div>
                        </div>
                    \`;
                }).join("");
            }
        }

        window.resetProjectForm = function() {
            document.getElementById("project-form").reset();
            editingProjectKey = null;
            deletedExtraImages = [];
            document.getElementById("project-bodyText").innerHTML = "";
            document.getElementById("project-form-title").textContent = "Neues Projekt hochladen";
            document.getElementById("project-image").required = true;
            document.getElementById("project-main-preview").classList.add("hidden");
            document.getElementById("project-existing-extras").classList.add("hidden");
            document.getElementById("project-existing-extras").innerHTML = "";
            document.getElementById("project-new-extras").classList.add("hidden");
            document.getElementById("project-new-extras").innerHTML = "";
            document.getElementById("project-cancel-btn").classList.add("hidden");
            document.getElementById("project-submit-btn").textContent = "Hochladen & Veröffentlichen";
            document.getElementById("project-custom-category-group").classList.add("hidden");
            document.getElementById("project-custom-category-name").required = false;
            document.getElementById("project-custom-category-name").value = "";
        };

        window.editProject = function(key) {
            const p = loadedProjectsList.find(proj => proj.key === key);
            if (!p) return;
            const meta = p.customMetadata || {};
            editingProjectKey = key;
            deletedExtraImages = [];
            
            document.getElementById("project-form-title").textContent = "Projekt bearbeiten";
            document.getElementById("project-category").value = meta.category || "";
            document.getElementById("project-title").value = (meta.title || "").replace(/\\\\n/g, ' ');
            document.getElementById("project-description").value = (meta.description || "").replace(/\\\\n/g, '\\n');
            document.getElementById("project-bodyText").innerHTML = parseAndFormatToHTML(meta.bodyText || "");
            document.getElementById("project-image").required = false;
            
            // Preview main
            const encodedKey = key.split('/').map(encodeURIComponent).join('/');
            document.getElementById("project-preview-img").src = imgProxy + encodedKey;
            document.getElementById("project-main-preview").classList.remove("hidden");
            
            // Existing extras
            const existingDiv = document.getElementById("project-existing-extras");
            existingDiv.innerHTML = "";
            if (meta.extraImages) {
                const extraKeys = meta.extraImages.split(",").map(k => k.trim()).filter(k => k.length > 0);
                if (extraKeys.length > 0) {
                    existingDiv.classList.remove("hidden");
                    existingDiv.innerHTML = "<h3 style='width:100%; font-size:0.85rem; margin-top:0.5rem; color:#666;'>Bestehende Bilder (Klicken zum Löschen):</h3>";
                    extraKeys.forEach(k => {
                        const item = document.createElement("div");
                        item.className = "extra-preview-item";
                        const img = document.createElement("img");
                        const encodedExtra = k.split('/').map(encodeURIComponent).join('/');
                        img.src = imgProxy + encodedExtra;
                        const delBtn = document.createElement("button");
                        delBtn.className = "delete-badge";
                        delBtn.type = "button";
                        delBtn.innerHTML = "&times;";
                        delBtn.onclick = () => {
                            deletedExtraImages.push(k);
                            item.style.display = "none";
                        };
                        item.appendChild(img);
                        item.appendChild(delBtn);
                        existingDiv.appendChild(item);
                    });
                }
            }
            
            document.getElementById("project-cancel-btn").classList.remove("hidden");
            document.getElementById("project-submit-btn").textContent = "Änderungen speichern";
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        document.getElementById("project-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("project-submit-btn");
            btn.disabled = true;
            
            const isEdit = !!editingProjectKey;
            const endpoint = isEdit ? "/api/update" : "/api/upload";
            btn.textContent = isEdit ? "Speichert..." : "Lädt hoch...";
            
            const formData = new FormData();
            if (isEdit) {
                formData.append("key", editingProjectKey);
                formData.append("deleted_extra_images", deletedExtraImages.join(","));
            }
            let projectCategory = document.getElementById("project-category").value;
            if (projectCategory === "custom") {
                projectCategory = document.getElementById("project-custom-category-name").value.trim();
            }
            formData.append("category", projectCategory);
            formData.append("title", document.getElementById("project-title").value);
            formData.append("description", document.getElementById("project-description").value);
            formData.append("bodyText", htmlToPlainText(document.getElementById("project-bodyText").innerHTML));
            
            const mainFile = document.getElementById("project-image").files[0];
            if (mainFile) {
                formData.append("image", mainFile);
                formData.append("image_name", mainFile.name);
                formData.append("image_type", mainFile.type);
            }
            
            const extraFiles = document.getElementById("project-extra-images").files;
            const extraNames = [];
            const extraTypes = [];
            for (let i = 0; i < extraFiles.length; i++) {
                formData.append("extra_images", extraFiles[i]);
                extraNames.push(extraFiles[i].name);
                extraTypes.push(extraFiles[i].type);
            }
            if (extraFiles.length > 0) {
                formData.append("extra_images_names", extraNames.join(","));
                formData.append("extra_images_types", extraTypes.join(","));
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "X-Admin-Password": savedPassword },
                body: formData
            });

            if (res.ok) {
                showStatus(isEdit ? "Projekt erfolgreich aktualisiert!" : "Projekt erfolgreich veröffentlicht!");
                resetProjectForm();
                setTimeout(() => loadProjects(), 2000);
            } else {
                let errMsg = isEdit ? "Fehler beim Aktualisieren." : "Fehler beim Hochladen.";
                try {
                    const errJson = await res.json();
                    if (errJson && errJson.error) errMsg += " (" + errJson.error + ")";
                } catch(err) {}
                showStatus(errMsg, true);
            }
            btn.disabled = false;
            btn.textContent = isEdit ? "Änderungen speichern" : "Hochladen & Veröffentlichen";
        });

        async function deleteProject(key) {
            if(!confirm("Projekt wirklich löschen?")) return;
            const res = await fetch("/api/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Admin-Password": savedPassword },
                body: JSON.stringify({ key })
            });
            if (res.ok) {
                showStatus("Projekt erfolgreich gelöscht.");
                loadProjects();
            } else {
                showStatus("Fehler beim Löschen des Projekts.", true);
            }
        }

        // --- JOBS ADMIN ---

        function slugify(text) {
            return text.toLowerCase()
                .replace(/ä/g, 'ae')
                .replace(/ö/g, 'oe')
                .replace(/ü/g, 'ue')
                .replace(/ß/g, 'ss')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-\$)+/g, '');
        }

        window.toggleProjectCategoryField = function() {
            const select = document.getElementById("project-category");
            const customGroup = document.getElementById("project-custom-category-group");
            if (select.value === "custom") {
                customGroup.classList.remove("hidden");
                document.getElementById("project-custom-category-name").required = true;
            } else {
                customGroup.classList.add("hidden");
                document.getElementById("project-custom-category-name").required = false;
                document.getElementById("project-custom-category-name").value = "";
            }
        };

        function getCategoryName(key) {
            switch (key) {
                case 'shk': return 'Anlagenmechaniker SHK';
                case 'service': return 'Kundendiensttechniker';
                case 'elektro': return 'Elektroniker';
                case 'azubi': return 'Ausbildung';
                default: return key;
            }
        }

        window.toggleCustomCategoryField = function() {
            const select = document.getElementById("job-category");
            const customGroup = document.getElementById("custom-category-group");
            if (select.value === "custom") {
                customGroup.classList.remove("hidden");
                document.getElementById("job-custom-category-name").required = true;
            } else {
                customGroup.classList.add("hidden");
                document.getElementById("job-custom-category-name").required = false;
                document.getElementById("job-custom-category-name").value = "";
            }
        };

        function populateCategoryDropdown() {
            const select = document.getElementById("job-category");
            const val = select.value;
            
            select.innerHTML = \`
                <option value="" disabled selected>Bitte wählen...</option>
                <option value="shk">Anlagenmechaniker SHK (shk)</option>
                <option value="service">Kundendiensttechniker (service)</option>
                <option value="elektro">Elektroniker (elektro)</option>
                <option value="azubi">Ausbildung (azubi)</option>
            \`;
            
            const customCats = {};
            loadedJobsList.forEach(j => {
                if (j.category && !["shk", "service", "elektro", "azubi"].includes(j.category)) {
                    customCats[j.category] = j.categoryName || j.category;
                }
            });
            
            for (const [key, label] of Object.entries(customCats)) {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = label + " (" + key + ")";
                select.appendChild(opt);
            }
            
            const optCustom = document.createElement("option");
            optCustom.value = "custom";
            optCustom.textContent = "+ Neue Kategorie erstellen...";
            select.appendChild(optCustom);
            
            select.value = val;
        }

        async function loadJobs() {
            const wrapper = document.getElementById("jobs-list-wrapper");
            const res = await fetch("/api/jobs");
            if (res.ok) {
                const jobs = await res.json();
                loadedJobsList = jobs;
                populateCategoryDropdown();
                if (jobs.length === 0) {
                    wrapper.innerHTML = "<p>Keine Stellenanzeigen gefunden.</p>";
                    return;
                }
                wrapper.innerHTML = jobs.map(j => {
                    const catLabel = j.categoryName || j.category;
                    const activeBadge = j.active ? "<span style='background:#e8f5e9; color:#2e7d32; font-size:0.75rem; padding:0.15rem 0.4rem; border-radius:4px; font-weight:600; margin-left:0.5rem;'>Aktiv</span>" : "<span style='background:#ffebee; color:#c62828; font-size:0.75rem; padding:0.15rem 0.4rem; border-radius:4px; font-weight:600; margin-left:0.5rem;'>Entwurf</span>";
                    const tagsStr = (j.tags || []).map(t => '<span class="item-tag">' + t + '</span>').join("");
                    return \`
                        <div class="list-item">
                            <div class="item-info">
                                <h4>\${j.title} \${activeBadge}</h4>
                                <small>\${catLabel}</small>
                                <div class="item-tags">\${tagsStr}</div>
                            </div>
                            <div class="btn-action-group">
                                <button class="btn-edit" onclick="editJob('\${j.id}')">Bearbeiten</button>
                                <button class="btn-dup" onclick="duplicateJob('\${j.id}')">Duplizieren</button>
                                <button class="btn-delete" onclick="deleteJob('\${j.id}')">Löschen</button>
                            </div>
                        </div>
                    \`;
                }).join("");
            }
        }

        window.resetJobForm = function() {
            document.getElementById("job-form").reset();
            editingJobId = null;
            document.getElementById("job-form-title").textContent = "Neue Stellenanzeige erstellen";
            document.getElementById("job-active").checked = true;
            document.getElementById("job-cancel-btn").classList.add("hidden");
            document.getElementById("job-submit-btn").textContent = "Stellenanzeige speichern";
            document.getElementById("custom-category-group").classList.add("hidden");
            document.getElementById("job-custom-category-name").required = false;
        };

        window.editJob = function(id) {
            const j = loadedJobsList.find(job => job.id === id);
            if (!j) return;
            editingJobId = id;
            
            populateCategoryDropdown();
            
            document.getElementById("job-form-title").textContent = "Stellenanzeige bearbeiten";
            document.getElementById("job-category").value = j.category || "";
            document.getElementById("job-title").value = j.title || "";
            document.getElementById("job-tags").value = (j.tags || []).join(", ");
            document.getElementById("job-intro").value = j.intro || "";
            document.getElementById("job-aufgaben").value = (j.aufgaben || []).join("\\n");
            document.getElementById("job-anforderungen").value = (j.anforderungen || []).join("\\n");
            document.getElementById("job-vorteile").value = (j.vorteile || []).join("\\n");
            document.getElementById("job-active").checked = !!j.active;
            
            const customGroup = document.getElementById("custom-category-group");
            customGroup.classList.add("hidden");
            document.getElementById("job-custom-category-name").required = false;
            
            document.getElementById("job-cancel-btn").classList.remove("hidden");
            document.getElementById("job-submit-btn").textContent = "Änderungen speichern";
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        window.duplicateJob = function(id) {
            const j = loadedJobsList.find(job => job.id === id);
            if (!j) return;
            editingJobId = null;
            
            populateCategoryDropdown();
            
            document.getElementById("job-form-title").textContent = "Stellenanzeige duplizieren";
            document.getElementById("job-category").value = j.category || "";
            document.getElementById("job-title").value = (j.title || "") + " (Kopie)";
            document.getElementById("job-tags").value = (j.tags || []).join(", ");
            document.getElementById("job-intro").value = j.intro || "";
            document.getElementById("job-aufgaben").value = (j.aufgaben || []).join("\\n");
            document.getElementById("job-anforderungen").value = (j.anforderungen || []).join("\\n");
            document.getElementById("job-vorteile").value = (j.vorteile || []).join("\\n");
            document.getElementById("job-active").checked = !!j.active;
            
            document.getElementById("custom-category-group").classList.add("hidden");
            document.getElementById("job-custom-category-name").required = false;
            
            document.getElementById("job-cancel-btn").classList.remove("hidden");
            document.getElementById("job-submit-btn").textContent = "Stellenanzeige speichern";
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        document.getElementById("job-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("job-submit-btn");
            btn.disabled = true;
            
            const select = document.getElementById("job-category");
            let catKey = select.value;
            let catName = "";
            
            if (catKey === "custom") {
                const newCatName = document.getElementById("job-custom-category-name").value.trim();
                catKey = slugify(newCatName);
                catName = newCatName;
            } else {
                const existingJob = loadedJobsList.find(j => j.category === catKey);
                catName = existingJob ? (existingJob.categoryName || existingJob.category) : getCategoryName(catKey);
            }
            
            const payload = {
                id: editingJobId,
                title: document.getElementById("job-title").value,
                category: catKey,
                categoryName: catName,
                tags: document.getElementById("job-tags").value.split(",").map(t => t.trim()).filter(t => t.length > 0),
                intro: document.getElementById("job-intro").value,
                aufgaben: document.getElementById("job-aufgaben").value.split("\\n").map(l => l.trim()).filter(l => l.length > 0),
                anforderungen: document.getElementById("job-anforderungen").value.split("\\n").map(l => l.trim()).filter(l => l.length > 0),
                vorteile: document.getElementById("job-vorteile").value.split("\\n").map(l => l.trim()).filter(l => l.length > 0),
                active: document.getElementById("job-active").checked
            };

            const res = await fetch("/api/jobs/save", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Admin-Password": savedPassword
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showStatus(editingJobId ? "Stellenanzeige erfolgreich aktualisiert!" : "Stellenanzeige erfolgreich erstellt!");
                resetJobForm();
                loadJobs();
            } else {
                let errMsg = "Fehler beim Speichern der Stellenanzeige.";
                try {
                    const errJson = await res.json();
                    if (errJson && errJson.error) errMsg += " (" + errJson.error + ")";
                } catch(err) {}
                showStatus(errMsg, true);
            }
            btn.disabled = false;
        });

        async function deleteJob(id) {
            if(!confirm("Stellenanzeige wirklich löschen?")) return;
            const res = await fetch("/api/jobs/delete", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Admin-Password": savedPassword
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                showStatus("Stellenanzeige erfolgreich gelöscht.");
                loadJobs();
            } else {
                showStatus("Fehler beim Löschen der Stellenanzeige.", true);
            }
        }

        // --- COMMON UTILS ---

        function parseInlineMarkdown(txt) {
            return txt
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/__(.*?)__/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/_(.*?)_/g, '<em>$1</em>')
                .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        }

        function cleanAndFormatHTML(htmlString) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const body = doc.body;
            let html = [];
            let inList = false;
            
            function isBold(node) {
                if (!node) return false;
                const style = node.getAttribute && node.getAttribute('style');
                if (style && (style.includes('font-weight: normal') || style.includes('font-weight:normal'))) return false;
                const fontWeight = style && (style.includes('font-weight: 700') || style.includes('font-weight:bold'));
                const tagName = node.tagName && node.tagName.toLowerCase();
                return fontWeight || tagName === 'strong' || tagName === 'b';
            }
            
            function isItalic(node) {
                if (!node) return false;
                const style = node.getAttribute && node.getAttribute('style');
                const fontStyle = style && (style.includes('font-style: italic') || style.includes('font-style:italic'));
                const tagName = node.tagName && node.tagName.toLowerCase();
                return fontStyle || tagName === 'em' || tagName === 'i';
            }

            function processNode(node) {
                if (node.nodeType === 3) {
                    const textContent = node.textContent.trim();
                    if (textContent.length > 0) html.push('<p>' + parseInlineMarkdown(node.textContent) + '</p>');
                    return;
                }
                if (node.nodeType !== 1) return;
                const tagName = node.tagName.toLowerCase();
                if (/^h[1-6]$/.test(tagName)) {
                    if (inList) { html.push('</ul>'); inList = false; }
                    const content = cleanInnerContent(node);
                    if (content.trim()) html.push('<h3 class="project-details-heading">' + content + '</h3>');
                    return;
                }
                if (tagName === 'ul' || tagName === 'ol') {
                    if (inList) { html.push('</ul>'); inList = false; }
                    html.push('<ul class="project-details-list">');
                    for (let child of node.childNodes) {
                        if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') {
                            const content = cleanInnerContent(child);
                            if (content.trim()) html.push('<li>' + content + '</li>');
                        }
                    }
                    html.push('</ul>');
                    return;
                }
                if (tagName === 'p') {
                    if (inList) { html.push('</ul>'); inList = false; }
                    const textContent = node.textContent.trim();
                    if (textContent.length === 0) return;
                    const listMatch = textContent.match(/^([•\\-\\*\\+])\\s*(.*)/);
                    if (listMatch) {
                        html.push('<ul class="project-details-list">');
                        const content = cleanInnerContent(node).replace(/^([•\\-\\*\\+])\\s*/, '');
                        html.push('<li>' + content + '</li>');
                        html.push('</ul>');
                        return;
                    }
                    const content = cleanInnerContent(node);
                    const isHeading = isBold(node) || (node.firstElementChild && isBold(node.firstElementChild) && textContent.length < 80);
                    if (isHeading && textContent.length < 80 && !/[.?!]$/.test(textContent)) {
                        html.push('<h3 class="project-details-heading">' + content + '</h3>');
                    } else {
                        html.push('<p>' + content + '</p>');
                    }
                    return;
                }
                if (tagName === 'br') {
                    if (inList) { html.push('</ul>'); inList = false; }
                    return;
                }
                for (let child of node.childNodes) {
                    processNode(child);
                }
            }
            
            function cleanInnerContent(element) {
                let contentArr = [];
                for (let child of element.childNodes) {
                    if (child.nodeType === 3) {
                        contentArr.push(parseInlineMarkdown(child.textContent));
                    } else if (child.nodeType === 1) {
                        const tag = child.tagName.toLowerCase();
                        const innerText = cleanInnerContent(child);
                        if (!innerText.trim()) continue;
                        if (tag === 'strong' || tag === 'b' || isBold(child)) {
                            contentArr.push('<strong>' + innerText + '</strong>');
                        } else if (tag === 'em' || tag === 'i' || isItalic(child)) {
                            contentArr.push('<em>' + innerText + '</em>');
                        } else if (tag === 'a') {
                            const href = child.getAttribute('href') || '#';
                            contentArr.push('<a href="' + href + '" target="_blank" rel="noopener">' + innerText + '</a>');
                        } else {
                            contentArr.push(innerText);
                        }
                    }
                }
                return contentArr.join('');
            }
            for (let child of body.childNodes) processNode(child);
            if (inList) html.push('</ul>');
            return html.join('\\n');
        }

        function parseAndFormatToHTML(txt) {
            if (!txt) return '';
            let cleanTxt = txt.replace(/\\\\r\\\\n/g, '\\n').replace(/\\\\n/g, '\\n').replace(/\\r\\n/g, '\\n').replace(/\\n/g, '\\n').trim();
            cleanTxt = cleanTxt.replace(/^(#{1,6})\\s*([•\\-\\*\\+])\\s*/gm, '$2 ');
            cleanTxt = cleanTxt.replace(/^(#{1,6})\\s+(#{1,6})\\s+/gm, '$1 ');
            const lines = cleanTxt.split('\\n');
            let html = [];
            let inList = false;
            
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.length === 0) {
                    if (inList) { html.push('</ul>'); inList = false; }
                    continue;
                }
                const listMatch = line.match(/^([•\\-\\*\\+])\\s*(.*)/);
                if (listMatch) {
                    if (!inList) { html.push('<ul class="project-details-list">'); inList = true; }
                    html.push('<li>' + parseInlineMarkdown(listMatch[2]) + '</li>');
                    continue;
                }
                if (inList) { html.push('</ul>'); inList = false; }
                const headerMatch = line.match(/^(#{1,6})\\s+(.*)/);
                if (headerMatch) {
                    const level = headerMatch[1].length;
                    const hLevel = level + 2 > 6 ? 6 : level + 2;
                    html.push('<h' + hLevel + ' class="project-details-heading">' + parseInlineMarkdown(headerMatch[2]) + '</h' + hLevel + '>');
                    continue;
                }
                const isShort = line.length < 80;
                const noEndingPunctuation = !/[.?!]$/.test(line);
                if (isShort && noEndingPunctuation) {
                    html.push('<h3 class="project-details-heading">' + parseInlineMarkdown(line) + '</h3>');
                } else {
                    html.push('<p>' + parseInlineMarkdown(line) + '</p>');
                }
            }
            if (inList) html.push('</ul>');
            return html.join('\\n');
        }

        function htmlToPlainText(html) {
            const temp = document.createElement("div");
            temp.innerHTML = html;
            let lines = [];
            
            function traverse(node) {
                if (node.nodeType === 3) {
                    const text = node.textContent;
                    if (text) {
                        if (lines.length === 0) lines.push("");
                        lines[lines.length - 1] += text;
                    }
                } else if (node.nodeType === 1) {
                    const tagName = node.tagName.toLowerCase();
                    if (tagName === "p" || tagName === "h1" || tagName === "h2" || tagName === "h3" || tagName === "h4" || tagName === "h5" || tagName === "h6") {
                        if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("");
                        let prefix = "";
                        if (tagName === "h3" || tagName === "h2" || tagName === "h1") prefix = "# ";
                        else if (tagName === "h4") prefix = "## ";
                        else if (tagName === "h5") prefix = "### ";
                        else if (tagName === "h6") prefix = "#### ";
                        lines.push(prefix);
                        for (let child of node.childNodes) traverse(child);
                        lines.push("");
                    } else if (tagName === "ul") {
                        if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("");
                        for (let child of node.childNodes) traverse(child);
                        lines.push("");
                    } else if (tagName === "li") {
                        lines.push("• ");
                        for (let child of node.childNodes) traverse(child);
                        lines.push("");
                    } else if (tagName === "br") {
                        lines.push("");
                    } else if (tagName === "strong" || tagName === "b") {
                        if (lines.length === 0) lines.push("");
                        lines[lines.length - 1] += "**";
                        for (let child of node.childNodes) traverse(child);
                        lines[lines.length - 1] += "**";
                    } else if (tagName === "em" || tagName === "i") {
                        if (lines.length === 0) lines.push("");
                        lines[lines.length - 1] += "*";
                        for (let child of node.childNodes) traverse(child);
                        lines[lines.length - 1] += "*";
                    } else if (tagName === "a") {
                        if (lines.length === 0) lines.push("");
                        const href = node.getAttribute("href") || "";
                        lines[lines.length - 1] += "[";
                        for (let child of node.childNodes) traverse(child);
                        lines[lines.length - 1] += "](" + href + ")";
                    } else {
                        for (let child of node.childNodes) traverse(child);
                    }
                }
            }
            
            for (let child of temp.childNodes) traverse(child);
            let result = lines.map(line => line.trim()).filter((line, index, arr) => {
                if (line === "") return index > 0 && arr[index - 1] !== "";
                return true;
            }).join("\\n");
            result = result.replace(/^(#{1,6})\\s*([•\\-\\*\\+])\\s*/gm, '$2 ');
            result = result.replace(/^(#{1,6})\\s+(#{1,6})\\s+/gm, '$1 ');
            return result.replace(/\\u00a0/g, ' ');
        }

        const projectBodyTextInput = document.getElementById("project-bodyText");
        if (projectBodyTextInput) {
            projectBodyTextInput.addEventListener("paste", function(e) {
                e.preventDefault();
                const htmlData = (e.clipboardData || window.clipboardData).getData('text/html');
                let htmlContent = "";
                if (htmlData && htmlData.trim().length > 0) {
                    htmlContent = cleanAndFormatHTML(htmlData);
                } else {
                    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                    htmlContent = parseAndFormatToHTML(text);
                }
                document.execCommand('insertHTML', false, htmlContent);
            });
        }

        document.getElementById("project-image").addEventListener("change", (e) => {
            const file = e.target.files[0];
            const previewDiv = document.getElementById("project-main-preview");
            const img = document.getElementById("project-preview-img");
            const labelSpan = previewDiv.querySelector("span");
            if (file) {
                img.src = URL.createObjectURL(file);
                previewDiv.classList.remove("hidden");
                if (labelSpan) labelSpan.textContent = editingProjectKey ? "(Ausgewähltes neues Bild - ersetzt das bestehende Bild)" : "";
            } else {
                if (editingProjectKey) {
                    const p = loadedProjectsList.find(proj => proj.key === editingProjectKey);
                    if (p) {
                        const encodedKey = p.key.split('/').map(encodeURIComponent).join('/');
                        img.src = imgProxy + encodedKey;
                        previewDiv.classList.remove("hidden");
                        if (labelSpan) labelSpan.textContent = "(Leer lassen, um das bestehende Bild zu behalten)";
                    }
                } else {
                    previewDiv.classList.add("hidden");
                }
            }
        });

        document.getElementById("project-extra-images").addEventListener("change", (e) => {
            const files = e.target.files;
            const container = document.getElementById("project-new-extras");
            container.innerHTML = "";
            if (files && files.length > 0) {
                container.classList.remove("hidden");
                const title = document.createElement("h3");
                title.style = "width:100%; font-size:0.85rem; margin-bottom:0.5rem; color:#666;";
                title.textContent = "Neu ausgewählte Bilder für den Upload:";
                container.appendChild(title);
                Array.from(files).forEach(file => {
                    const item = document.createElement("div");
                    item.className = "extra-preview-item";
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(file);
                    item.appendChild(img);
                    container.appendChild(item);
                });
            } else {
                container.classList.add("hidden");
            }
        });
    </script>
</body>
</html>
      `;
      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // Image Proxy: serve R2 images directly through this worker
    if (url.pathname.startsWith("/img/")) {
      try {
        const key = decodeURIComponent(url.pathname.slice(5)); // Remove "/img/"
        const obj = await env.BUCKET.get(key);
        if (!obj) {
          return new Response(JSON.stringify({ error: "Image not found", key, pathLen: url.pathname.length }), { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        }
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", obj.httpMetadata?.contentType || "image/jpeg");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(obj.body, { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // Fallback: Serve static assets
    return env.ASSETS.fetch(request);
  }
}
