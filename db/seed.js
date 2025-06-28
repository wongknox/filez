import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  console.log("Seeding database...");

  const folderNames = ["Documents", "Photos", "Software"];
  const folderIds = {};

  for (const name of folderNames) {
    const { rows } = await db.query(
      `INSERT INTO folders (name) VALUES ($1) RETURNING id;`,
      [name]
    );
    folderIds[name] = rows[0].id;
  }
  console.log("Folders inserted:", folderIds);

  const filesToInsert = [
    // Documents
    { name: "Project_Plan.docx", size: 1024, folder_name: "Documents" },
    { name: "Meeting_Notes.txt", size: 512, folder_name: "Documents" },
    { name: "Budget_2025.xlsx", size: 2048, folder_name: "Documents" },
    { name: "Research_Paper.pdf", size: 3072, folder_name: "Documents" },
    { name: "Client_Report.pdf", size: 1536, folder_name: "Documents" },
    { name: "Draft_Email.txt", size: 256, folder_name: "Documents" },

    // Photos
    { name: "Vacation_01.jpg", size: 4096, folder_name: "Photos" },
    { name: "Family_Reunion.png", size: 3500, folder_name: "Photos" },
    { name: "Screenshot_2025.png", size: 800, folder_name: "Photos" },
    { name: "Pets.jpg", size: 2000, folder_name: "Photos" },
    { name: "Landscape.jpg", size: 3000, folder_name: "Photos" },
    { name: "Selfie.jpg", size: 1000, folder_name: "Photos" },

    // Software
    { name: "Installer.exe", size: 10240, folder_name: "Software" },
    { name: "README.md", size: 700, folder_name: "Software" },
    { name: "Config.ini", size: 120, folder_name: "Software" },
    { name: "Patch_Notes.txt", size: 400, folder_name: "Software" },
    { name: "Plugin.dll", size: 5000, folder_name: "Software" },
    { name: "License.txt", size: 300, folder_name: "Software" },
  ];

  const insertFiles = filesToInsert.map((file) => {
    const sql = `
      INSERT INTO files (name, size, folder_id)
      VALUES ($1, $2, $3);
    `;
    return db.query(sql, [file.name, file.size, folderIds[file.folder_name]]);
  });

  await Promise.all(insertFiles);
  console.log(`Inserted ${filesToInsert.length} files into folders.`);

  console.log("Database seeding complete.");
}
