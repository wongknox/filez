import express from "express";
import db from "#db/client";

const app = express();

app.use(express.json());

app.get("/files", async (req, res, next) => {
  try {
    const sql = `
        SELECT
        files.id,
        files.name,
        files.size,
        files.folder_id,
        folders.name AS folder_name
        FROM files
        JOIN folders ON files.folder_id = folders.id;
        `;
    const { rows: files } = await db.query(sql);
    res.json(files);
  } catch (error) {
    next(error);
  }
});

app.get("/folders", async (req, res, next) => {
  try {
    const sql = `
        SELECT *
        FROM folders;
        `;
    const { rows: folders } = await db.query(sql);
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

app.get("/folders/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const sql = `
        SELECT
        folders.id,
        folders.name,
        json_agg(
          json_build_object(
            'id', files.id,
            'name', files.name,
            'size', files.size, 
            'folder_id', files.folder_id
          )
        ) FILTER (WHERE files.id IS NOT NULL) AS files
         FROM folders
         LEFT JOIN files ON folders.id = files.folder_id
         WHERE folders.id = $1
         GROUP BY folders.id, folders.name;
        `;
    const { rows } = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const folder = rows[0];
    res.json(folder);
  } catch (error) {
    next(error);
  }
});

app.post("/folders/:id/files", async (req, res, next) => {
  const { id: folderId } = req.params;

  try {
    const folderCheckSql = `SELECT id FROM folders WHERE id = $1`;
    const folderCheckResult = await db.query(folderCheckSql, [folderId]);
    if (folderCheckResult.rows.length === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (req.body == null) {
      return res.status(400).json({ message: "Request body not provided" });
    }

    const { name, size } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Missing or not a valid name" });
    }

    if (size === undefined || typeof size !== "number" || size < 0) {
      return res.status(400).json({ message: "Missing or invalid size" });
    }

    const insertFileSql = `
        INSERT INTO files (name, size, folder_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, size, folder_id;
        `;
    const {
      rows: [newFile],
    } = await db.query(insertFileSql, [name.trim(), size, folderId]);

    res.status(201).json(newFile);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

export default app;
