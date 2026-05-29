import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 8080);
let whatsapp = "8839173936";
let adminPassword = "0000";
const fileCache = new Map();

const semesters = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `Semester ${index + 1}`,
  slug: `semester-${index + 1}`,
  code: String(index + 1),
  fullName: `Semester ${index + 1}`,
  description: null
}));

const branchNames = [
  ["ALL Branch 1st Year", "all-branch-1st-year", "ALL", "All Branches First Year"],
  ["CSE", "cse", "CSE", "Computer Science and Engineering"],
  ["AIDS / AD", "aids-ad", "AD", "Artificial Intelligence and Data Science"],
  ["AIML / AL", "aiml-al", "AL", "Artificial Intelligence and Machine Learning"],
  ["AI", "ai", "AI", "Artificial Intelligence"],
  ["AUTO", "auto", "AUTO", "Automobile Engineering"],
  ["Auto & Robo", "auto-and-robo", "AR", "Automobile and Robotics Engineering"],
  ["CHEMICAL", "chemical", "CH", "Chemical Engineering"],
  ["CIVIL", "civil", "CE", "Civil Engineering"],
  ["CSBS / CB", "csbs-cb", "CB", "Computer Science and Business Systems"],
  ["CSE-DS / CD", "cse-ds-cd", "CD", "Computer Science and Engineering - Data Science"],
  ["CSE-IOT", "cse-iot", "CI", "Computer Science and Engineering - Internet of Things"],
  ["CSIT", "csit", "CSIT", "Computer Science and Information Technology"],
  ["3DAG", "3dag", "3DAG", "Three Dimensional Animation and Graphics"],
  ["IOT", "iot", "IOT", "Internet of Things"],
  ["IS / IOT-CS", "is-iot-cs", "IS", "Information Science / IoT Cyber Security"],
  ["CY", "cy", "CY", "Cyber Security"],
  ["EC", "ec", "EC", "Electronics and Communication Engineering"],
  ["EE", "ee", "EE", "Electrical Engineering"],
  ["EEE", "eee", "EEE", "Electrical and Electronics Engineering"],
  ["EI", "ei", "EI", "Electronics and Instrumentation Engineering"],
  ["EX", "ex", "EX", "Electrical and Electronics"],
  ["FT", "ft", "FT", "Fire Technology and Safety Engineering"],
  ["IT", "it", "IT", "Information Technology"],
  ["ME", "me", "ME", "Mechanical Engineering"],
  ["MINING / MI", "mining-mi", "MI", "Mining Engineering"],
  ["MM", "mm", "MM", "Mining Machinery Engineering"],
  ["RA", "ra", "RA", "Robotics and Automation"],
  ["Robo And Mech", "robo-and-mech", "RM", "Robotics and Mechanical Engineering"],
  ["SD / CSD", "sd-csd", "CSD", "Computer Science and Design"],
  ["OTHERS", "others", "OTH", "Other Branches"],
  ["TX", "tx", "TX", "Textile Technology"]
];

const branches = branchNames.map(([name, slug, code, fullName], index) => ({
  id: index + 1,
  name,
  slug,
  code,
  fullName,
  description: null
}));

const subjects = [
  option(1, "Engineering Mathematics I", "engineering-mathematics-i", "BT101"),
  option(2, "Engineering Physics", "engineering-physics", "BT102"),
  option(3, "Data Structures", "data-structures", "CS301"),
  option(4, "Database Management Systems", "database-management-systems", "CS401"),
  option(5, "Machine Learning", "machine-learning", "CS601"),
  option(6, "Computer Networks", "computer-networks", "CS502")
];

const categories = [
  "Python",
  "Java",
  "C",
  "C++",
  "DSA",
  "Web Development",
  "App Development",
  "Backend Development",
  "Database",
  "Git & GitHub",
  "AI/ML",
  "Data Science",
  "Projects",
  "Interview Preparation"
].map((name, index) => option(index + 1, name, slug(name), null, `${name} notes and resources.`));

const now = new Date().toISOString();
let notes = [];

function option(id, name, slugValue, code = null, description = null) {
  return { id, name, slug: slugValue, code, fullName: name, description };
}

function note(noteType, title, subject, branch, semester, programmingCategory, fileType, fileSize, downloadCount) {
  const id = randomUUID();
  return {
    id,
    title,
    description: "Local development sample record for frontend preview.",
    fileUrl: `/api/notes/${id}/download`,
    downloadUrl: `/api/notes/${id}/download`,
    fileName: `${slug(title)}.${fileType.toLowerCase()}`,
    fileType,
    fileSize,
    readableFileSize: humanSize(fileSize),
    noteType,
    semester,
    branch,
    subject,
    programmingCategory,
    tags: ["verified", "dev"],
    downloadCount,
    published: true,
    createdAt: now,
    updatedAt: now
  };
}

function slug(value) {
  return value.toLowerCase().replace("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    ...corsHeaders()
  });
  res.end(JSON.stringify(body));
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Requested-With",
    "Access-Control-Expose-Headers": "Content-Disposition"
  };
}

async function bodyJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function parseMultipartFields(rawBody, boundary) {
  const fields = {};
  const parts = rawBody.split(boundary);
  for (const part of parts) {
    if (part.includes('name="')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        const lines = part.split("\r\n");
        const headerIndex = lines.findIndex(l => l.startsWith("Content-Disposition"));
        if (headerIndex !== -1) {
          let valueIndex = headerIndex + 1;
          while (valueIndex < lines.length && lines[valueIndex] !== "") {
            valueIndex++;
          }
          if (valueIndex + 1 < lines.length) {
            let value = lines.slice(valueIndex + 1).join("\r\n");
            value = value.replace(/\r\n$/, "").replace(/--$/, "");
            fields[name] = value.trim();
          }
        }
      }
    }
  }
  return fields;
}

function extractFileBuffer(rawBuffer, boundaryStr) {
  const boundary = Buffer.from("\r\n" + boundaryStr);
  const headerEnd = Buffer.from("\r\n\r\n");
  
  const filenameIndex = rawBuffer.indexOf('filename="');
  if (filenameIndex === -1) return null;
  
  const partStart = rawBuffer.lastIndexOf(boundaryStr, filenameIndex);
  if (partStart === -1) return null;
  
  const contentStart = rawBuffer.indexOf(headerEnd, filenameIndex);
  if (contentStart === -1) return null;
  
  const dataStart = contentStart + headerEnd.length;
  
  const nextBoundary = rawBuffer.indexOf(boundary, dataStart);
  if (nextBoundary === -1) return null;
  
  return rawBuffer.subarray(dataStart, nextBoundary);
}

async function parseMultipartRequest(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return {};
  const boundary = "--" + boundaryMatch[1];

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBuffer = Buffer.concat(chunks);
  const rawBodyText = rawBuffer.toString("latin1");
  
  const fields = parseMultipartFields(rawBodyText, boundary);
  
  const filenameMatch = rawBodyText.match(/filename="([^"]+)"/);
  if (filenameMatch) {
    fields.fileName = filenameMatch[1];
    
    const filenameIndex = rawBuffer.indexOf('filename="');
    if (filenameIndex !== -1) {
      const contentStart = rawBuffer.indexOf(Buffer.from("\r\n\r\n"), filenameIndex);
      if (contentStart !== -1) {
        const headerPart = rawBuffer.subarray(filenameIndex, contentStart).toString("utf8");
        const ctMatch = headerPart.match(/Content-Type:\s*([^\r\n]+)/i);
        fields.fileContentType = ctMatch ? ctMatch[1].trim() : "application/octet-stream";
      }
    }

    const fileBytes = extractFileBuffer(rawBuffer, boundary);
    if (fileBytes) {
      fields.fileBytes = fileBytes;
      fields.fileSize = fileBytes.length;
    }
  }
  return fields;
}

function page(content) {
  return {
    content,
    number: 0,
    size: content.length,
    totalElements: content.length,
    totalPages: 1
  };
}

function requireAuth(req, res) {
  if (!req.headers.authorization?.startsWith("Bearer ")) {
    json(res, 401, { message: "Admin token is required." });
    return false;
  }
  return true;
}

function dashboard() {
  return {
    totalNotes: notes.length,
    totalDownloads: notes.reduce((sum, item) => sum + item.downloadCount, 0),
    totalRgpvMaterials: notes.filter((item) => item.noteType === "RGPV").length,
    totalProgrammingNotes: notes.filter((item) => item.noteType === "PROGRAMMING").length,
    totalCommonDocuments: notes.filter((item) => item.noteType === "COMMON").length,
    recentlyUploadedFiles: notes.slice(0, 8),
    popularDownloads: [...notes].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 8)
  };
}

function filteredSearch(query) {
  const q = query.toLowerCase();
  return notes.filter((item) =>
    [
      item.title,
      item.description,
      item.fileName,
      item.subject?.name,
      item.branch?.name,
      item.programmingCategory?.name,
      ...item.tags
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(q))
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    if (url.pathname === "/actuator/health") return json(res, 200, { status: "UP" });
    if (url.pathname === "/api/settings/whatsapp") return json(res, 200, { key: "whatsapp_number", value: whatsapp });
    if (url.pathname === "/api/notes/rgpv/semesters") return json(res, 200, semesters);
    if (/^\/api\/notes\/rgpv\/semesters\/\d+\/branches$/.test(url.pathname)) return json(res, 200, branches);
    if (url.pathname === "/api/notes/rgpv") {
      const semester = url.searchParams.get("semester");
      const branch = url.searchParams.get("branch");
      return json(
        res,
        200,
        notes.filter((item) => item.noteType === "RGPV" && (!semester || String(item.semester?.id) === semester) && (!branch || String(item.branch?.id) === branch))
      );
    }
    if (url.pathname === "/api/notes/programming") {
      return json(
        res,
        200,
        categories.map((category) => ({
          category,
          notes: notes.filter((item) => item.noteType === "PROGRAMMING" && item.programmingCategory?.id === category.id)
        }))
      );
    }
    if (url.pathname.startsWith("/api/notes/programming/")) {
      const categorySlug = url.pathname.split("/").at(-1);
      return json(res, 200, notes.filter((item) => item.noteType === "PROGRAMMING" && item.programmingCategory?.slug === categorySlug));
    }
    if (url.pathname === "/api/notes/common") return json(res, 200, notes.filter((item) => item.noteType === "COMMON"));
    if (url.pathname === "/api/notes/recent") return json(res, 200, notes.slice(0, 8));
    if (url.pathname === "/api/notes/popular") return json(res, 200, [...notes].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 8));
    if (url.pathname === "/api/notes/search") return json(res, 200, filteredSearch(url.searchParams.get("q") || ""));
function getFallbackPdf() {
  return Buffer.from(
    "%PDF-1.4\n" +
    "1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n" +
    "2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj\n" +
    "3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>> endobj\n" +
    "4 0 obj <</Length 46>> stream\n" +
    "BT /F1 24 Tf 100 700 Td (Engineers Pool Dev Preview) Tj ET\n" +
    "endstream endobj\n" +
    "xref\n" +
    "0 5\n" +
    "0000000000 65535 f \n" +
    "0000000009 00000 n \n" +
    "0000000052 00000 n \n" +
    "0000000101 00000 n \n" +
    "0000000250 00000 n \n" +
    "trailer <</Size 5/Root 1 0 R>>\n" +
    "startxref\n" +
    "345\n" +
    "%%EOF\n",
    "utf8"
  );
}

    if (/^\/api\/notes\/[^/]+\/(download|preview)$/.test(url.pathname)) {
      const parts = url.pathname.split("/");
      const id = parts[parts.length - 2];
      
      const cached = fileCache.get(id);
      if (cached) {
        res.writeHead(200, {
          "Content-Type": cached.contentType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(cached.fileName)}"`,
          ...corsHeaders()
        });
        res.end(cached.data);
        return;
      }
      
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"engineers-pool-dev-preview.pdf\"",
        ...corsHeaders()
      });
      res.end(getFallbackPdf());
      return;
    }

    if (url.pathname === "/api/admin/auth/login" && req.method === "POST") {
      const body = await bodyJson(req);
      if (body.email === "admin@engineerspool.local" && body.password === adminPassword) {
        return json(res, 200, {
          token: "dev-token",
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          email: body.email,
          roles: ["ROLE_ADMIN"]
        });
      }
      return json(res, 401, { message: "Invalid email or password." });
    }
 
    if (url.pathname === "/api/admin/auth/google" && req.method === "POST") {
      const body = await bodyJson(req);
      if (body.credential) {
        return json(res, 200, {
          token: "dev-token-google",
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          email: "admin@engineerspool.local",
          roles: ["ROLE_ADMIN"]
        });
      }
      return json(res, 400, { message: "Credential token is required." });
    }

    if (url.pathname.startsWith("/api/admin/") && !requireAuth(req, res)) return;
    if (url.pathname === "/api/admin/auth/change-password" && req.method === "POST") {
      const body = await bodyJson(req);
      if (body.currentPassword !== adminPassword) return json(res, 400, { message: "Current password is incorrect." });
      adminPassword = body.newPassword;
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }
    if (url.pathname === "/api/admin/dashboard") return json(res, 200, dashboard());
    if (url.pathname === "/api/admin/notes" && req.method === "GET") return json(res, 200, page(notes));
    if (url.pathname.startsWith("/api/admin/notes/") && req.method === "PATCH") {
      const id = url.pathname.split("/").at(-1);
      const body = await bodyJson(req);
      const note = notes.find((item) => item.id === id);
      if (note) {
        note.published = body.published;
        return json(res, 200, note);
      }
      return json(res, 404, { message: "Note not found." });
    }
    if (url.pathname.startsWith("/api/admin/notes/") && req.method === "DELETE") {
      const id = url.pathname.split("/").at(-1);
      notes = notes.filter((item) => item.id !== id);
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }
    if (url.pathname.startsWith("/api/admin/notes/") && req.method === "PUT") {
      const id = url.pathname.split("/").at(-1);
      const fields = await parseMultipartRequest(req);
      const note = notes.find((item) => item.id === id);
      if (note) {
        if (fields.title) note.title = fields.title;
        if (fields.description !== undefined) note.description = fields.description;
        if (fields.tags !== undefined) note.tags = fields.tags.split(",").map(t => t.trim()).filter(Boolean);
        if (fields.fileName) {
          note.fileName = fields.fileName;
          note.fileType = fields.fileName.split(".").pop().toUpperCase();
          note.fileSize = Number(fields.fileSize || 1048576);
          note.readableFileSize = humanSize(note.fileSize);
          if (fields.fileBytes) {
            fileCache.set(note.id, {
              data: fields.fileBytes,
              contentType: fields.fileContentType || "application/octet-stream",
              fileName: fields.fileName
            });
          }
        }
        note.updatedAt = new Date().toISOString();
        return json(res, 200, note);
      }
      return json(res, 404, { message: "Note not found." });
    }
    if (url.pathname.startsWith("/api/admin/notes") && req.method === "POST") {
      const fields = await parseMultipartRequest(req);
      const isRgpv = url.pathname.endsWith("/rgpv");
      const isProgramming = url.pathname.endsWith("/programming");
      
      const fileKey = randomUUID();
      const newNote = {
        id: fileKey,
        title: fields.title || "Untitled Note",
        description: fields.description || "",
        fileUrl: `/api/notes/${fileKey}/download`,
        downloadUrl: `/api/notes/${fileKey}/download`,
        fileName: fields.fileName || "note.pdf",
        fileType: (fields.fileName || "note.pdf").split(".").pop().toUpperCase(),
        fileSize: Number(fields.fileSize || 1048576),
        readableFileSize: humanSize(Number(fields.fileSize || 1048576)),
        noteType: isRgpv ? "RGPV" : isProgramming ? "PROGRAMMING" : "COMMON",
        semester: isRgpv ? semesters.find(s => String(s.id) === fields.semesterId) || semesters[0] : null,
        branch: isRgpv ? branches.find(b => String(b.id) === fields.branchId) || branches[0] : null,
        subject: isRgpv ? { id: Date.now(), name: fields.subjectName || "General Subject", slug: slug(fields.subjectName || "general") } : null,
        programmingCategory: isProgramming ? categories.find(c => String(c.id) === fields.programmingCategoryId) || categories[0] : null,
        tags: (fields.tags || "").split(",").map(t => t.trim()).filter(Boolean),
        downloadCount: 0,
        published: fields.published === "true",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (fields.fileBytes) {
        fileCache.set(fileKey, {
          data: fields.fileBytes,
          contentType: fields.fileContentType || "application/octet-stream",
          fileName: fields.fileName || "note.pdf"
        });
      }
      
      notes.unshift(newNote);
      return json(res, 200, newNote);
    }
    if (url.pathname === "/api/admin/semesters") return json(res, 200, semesters);
    if (url.pathname === "/api/admin/branches") return json(res, 200, branches);
    if (url.pathname === "/api/admin/subjects") return json(res, 200, subjects);
    if (url.pathname === "/api/admin/programming-categories") return json(res, 200, categories);
    if (url.pathname === "/api/admin/settings/whatsapp" && req.method === "PUT") {
      const body = await bodyJson(req);
      whatsapp = body.value;
      return json(res, 200, { key: "whatsapp_number", value: whatsapp });
    }
    if (["/api/admin/semesters", "/api/admin/branches", "/api/admin/subjects", "/api/admin/programming-categories"].includes(url.pathname) && req.method === "POST") {
      const body = await bodyJson(req);
      return json(res, 200, option(Date.now(), body.name || "New item", body.slug || slug(body.name || "new-item"), body.code || null, body.description || null));
    }

    json(res, 404, { message: "Not found." });
  } catch (error) {
    json(res, 500, { message: error instanceof Error ? error.message : "Server error." });
  }
});

server.listen(port, () => {
  console.log(`Engineers Pool dev mock API running on http://localhost:${port}`);
});
