import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FileTree = ({ repoId, refresh, isOwner, userId }) => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [editingFile, setEditingFile] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [addingIn, setAddingIn] = useState(null); // path where we're adding
    const [newFileData, setNewFileData] = useState({ name: "", content: "", type: "file" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!repoId) return;
        fetchFiles();
    }, [repoId, refresh]);

    const fetchFiles = async () => {
        if (!repoId || !userId) return;
        try {
            // ✅ fetch from storage route instead of DB
            const res = await fetch(
                `http://localhost:3000/file/storage/${userId}/${repoId}`
            );
            const data = await res.json();
            setFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching files:", err);
        }
    };

    // ── Delete ──────────────────────────────────────────────
    const handleDelete = async (e, fileId, fileName) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${fileName}"?`)) return;
        try {
            await fetch(`http://localhost:3000/file/${fileId}`, { method: "DELETE" });
            setFiles(prev => prev.filter(f => f.id !== fileId));
            if (selectedFile?.id === fileId) setSelectedFile(null);
        } catch (err) { alert("Failed to delete file"); }
    };

    // ── Edit / Save ─────────────────────────────────────────
    const handleEditSave = async () => {
        setSaving(true);
        try {
            await fetch(`http://localhost:3000/file/${editingFile.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent }),
            });
            setFiles(prev => prev.map(f =>
                f.id === editingFile.id ? { ...f, content: editContent } : f
            ));
            setSelectedFile(prev => prev?.id === editingFile.id
                ? { ...prev, content: editContent } : prev
            );
            setEditingFile(null);
        } catch (err) { alert("Failed to save file"); }
        finally { setSaving(false); }
    };

    // ── Add file inside folder ───────────────────────────────
    const handleAddFile = async (parentPath) => {
        if (!newFileData.name) return alert("File name is required");
        const fullPath = parentPath
            ? `${parentPath}/${newFileData.name}`
            : newFileData.name;
        setSaving(true);
        try {
            const res = await fetch("http://localhost:3000/file/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repo_id: repoId,
                    name: newFileData.name,
                    path: fullPath,
                    content: newFileData.content || "",
                    type: newFileData.type,
                }),
            });
            const created = await res.json();
            setFiles(prev => [...prev, created]);
            setAddingIn(null);
            setNewFileData({ name: "", content: "", type: "file" });
            // auto-expand parent folder
            if (parentPath) {
                setExpandedFolders(prev => ({ ...prev, [parentPath]: true }));
            }
        } catch (err) { alert("Failed to create file"); }
        finally { setSaving(false); }
    };

    const handleFileClick = async (meta) => {
        if (meta.url) {
            try {
                const res = await fetch(meta.url);
                const text = await res.text();
                setSelectedFile({ ...meta, content: text });
            } catch (err) {
                setSelectedFile(meta);
            }
        } else {
            setSelectedFile(meta);
        }
    };


    // ── Tree builder ─────────────────────────────────────────
    const buildTree = (files) => {
        const tree = {};

        files.forEach((file) => {
            const parts = file.path.split("/");
            let current = tree;
            let pathSoFar = "";

            parts.forEach((part, index) => {
                const isLast = index === parts.length - 1;
                pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

                if (!current[part]) {
                    current[part] = {
                        __meta: isLast
                            ? file
                            : { type: "folder", name: part, path: pathSoFar },
                        __children: {},
                        __path: pathSoFar,
                        __name: part,   // ✅ always the visible segment name
                    };
                } else {
                    // node already exists (created as implicit parent)
                    // if this is the actual DB record, update meta but keep __name
                    if (isLast) {
                        current[part].__meta = file;
                        current[part].__name = part; // ✅ keep segment name, not full path
                    }
                }

                current = current[part].__children;
            });
        });

        return tree;
    };


    const toggleFolder = (path) => {
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    // ── Render ───────────────────────────────────────────────
    const renderTree = (tree, depth = 0, parentPath = "") => {
        // folders first, then files
        const entries = Object.entries(tree).sort(([, a], [, b]) => {
            const aIsFolder = a.__meta.type === "folder" || Object.keys(a.__children).length > 0;
            const bIsFolder = b.__meta.type === "folder" || Object.keys(b.__children).length > 0;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return 0;
        });

        return entries.map(([key, value]) => {
            const meta = value.__meta;
            const nodePath = value.__path;
            const displayName = value.__name || key.split("/").pop();
            const hasChildren = Object.keys(value.__children).length > 0;
            const isFolder = meta.type === "folder" || hasChildren;
            const isExpanded = expandedFolders[nodePath];
            const isSelected = selectedFile?.id === meta?.id;

            return (
                <div key={nodePath}>
                    {/* Row */}
                    <div
                        className="file-row"
                        onClick={() => isFolder ? toggleFolder(nodePath) : handleFileClick(meta)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 16px",
                            paddingLeft: `${16 + depth * 20}px`,
                            cursor: "pointer",
                            borderBottom: "1px solid #21262d",
                            backgroundColor: isSelected ? "#1c2128" : "transparent",
                            color: "#c9d1d9",
                            fontSize: "14px",
                            userSelect: "none",
                        }}
                        onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = "#161b22";
                            e.currentTarget.querySelectorAll(".row-action").forEach(b => b.style.opacity = "1");
                        }}
                        onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.querySelectorAll(".row-action").forEach(b => b.style.opacity = "0");
                        }}
                    >
                        {/* Left: chevron + icon + name */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {isFolder ? (
                                <span style={{ fontSize: "11px", color: "#8b949e", width: "12px" }}>
                                    {isExpanded ? "▼" : "▶"}
                                </span>
                            ) : (
                                <span style={{ width: "12px" }} />
                            )}
                            <span style={{ fontSize: "15px" }}>
                                {isFolder ? (isExpanded ? "📂" : "📁") : "📄"}
                            </span>


                            <span style={{ color: isFolder ? "#c9d1d9" : "#58a6ff" }}>
                                {displayName}
                            </span>
                        </div>

                        {/* Right: action buttons (owner only) */}
                        {isOwner && (
                            <div style={{ display: "flex", gap: "6px" }}>
                                {/* Add file inside folder */}
                                {isFolder && (
                                    <button
                                        className="row-action"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setAddingIn(nodePath);
                                            setExpandedFolders(prev => ({ ...prev, [nodePath]: true }));
                                        }}
                                        style={actionBtnStyle("#238636")}
                                    >+ Add</button>
                                )}
                                {/* Edit file */}
                                {!isFolder && (
                                    <button
                                        className="row-action"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setEditingFile(meta);
                                            setEditContent(meta.content || "");
                                            setSelectedFile(meta);
                                        }}
                                        style={actionBtnStyle("#1f6feb")}
                                    >Edit</button>
                                )}
                                {/* Delete file */}
                                {!isFolder && (
                                    <button
                                        className="row-action"
                                        onClick={e => handleDelete(e, meta.id, key)}
                                        style={actionBtnStyle("#f85149", "#f8514933")}
                                    >Delete</button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Add file form inside folder */}
                    {isFolder && isExpanded && addingIn === nodePath && (
                        <div style={{
                            paddingLeft: `${16 + (depth + 1) * 20}px`,
                            padding: "10px 16px",
                            paddingLeft: `${32 + depth * 20}px`,
                            backgroundColor: "#0d1117",
                            borderBottom: "1px solid #21262d",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input
                                    autoFocus
                                    placeholder="filename.js"
                                    value={newFileData.name}
                                    onChange={e => setNewFileData(p => ({ ...p, name: e.target.value }))}
                                    style={inputStyle}
                                />
                                <select
                                    value={newFileData.type}
                                    onChange={e => setNewFileData(p => ({ ...p, type: e.target.value }))}
                                    style={{ ...inputStyle, width: "110px" }}
                                >
                                    <option value="file">📄 File</option>
                                    <option value="folder">📁 Folder</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="File content (optional)"
                                value={newFileData.content}
                                onChange={e => setNewFileData(p => ({ ...p, content: e.target.value }))}
                                rows={3}
                                style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => handleAddFile(nodePath)}
                                    disabled={saving}
                                    style={greenBtnStyle}
                                >
                                    {saving ? "Adding..." : "Add File"}
                                </button>
                                <button
                                    onClick={() => { setAddingIn(null); setNewFileData({ name: "", content: "", type: "file" }); }}
                                    style={cancelBtnStyle}
                                >Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* Children */}
                    {isFolder && isExpanded && renderTree(value.__children, depth + 1, nodePath)}
                </div>
            );
        });
    };

    const tree = buildTree(files);

    return (
        <div>
            {/* File Tree */}
            <div style={{
                border: "1px solid #30363d",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#0d1117",
            }}>
                {/* Header */}
                <div style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #30363d",
                    backgroundColor: "#161b22",
                    color: "#8b949e",
                    fontSize: "13px",
                    fontWeight: 500,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span>📂 Files</span>
                    {isOwner && (
                        <button
                            onClick={() => setAddingIn("__root__")}
                            style={{ ...greenBtnStyle, padding: "3px 10px", fontSize: "12px" }}
                        >+ Add file</button>
                    )}
                </div>

                {/* Root level add form */}
                {addingIn === "__root__" && (
                    <div style={{
                        padding: "10px 16px",
                        backgroundColor: "#161b22",
                        borderBottom: "1px solid #30363d",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                autoFocus
                                placeholder="filename.js or src/index.js"
                                value={newFileData.name}
                                onChange={e => setNewFileData(p => ({ ...p, name: e.target.value }))}
                                style={inputStyle}
                            />
                            <select
                                value={newFileData.type}
                                onChange={e => setNewFileData(p => ({ ...p, type: e.target.value }))}
                                style={{ ...inputStyle, width: "110px" }}
                            >
                                <option value="file">📄 File</option>
                                <option value="folder">📁 Folder</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="File content (optional)"
                            value={newFileData.content}
                            onChange={e => setNewFileData(p => ({ ...p, content: e.target.value }))}
                            rows={3}
                            style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => handleAddFile("")}
                                disabled={saving}
                                style={greenBtnStyle}
                            >{saving ? "Adding..." : "Add File"}</button>
                            <button
                                onClick={() => { setAddingIn(null); setNewFileData({ name: "", content: "", type: "file" }); }}
                                style={cancelBtnStyle}
                            >Cancel</button>
                        </div>
                    </div>
                )}

                {files.length === 0 && addingIn !== "__root__"
                    ? <p style={{ padding: "1rem", color: "#8b949e", margin: 0 }}>No files yet.</p>
                    : renderTree(tree)
                }
            </div>

            {/* File Content Viewer / Editor */}
            {selectedFile && (
                <div style={{
                    marginTop: "1rem",
                    border: "1px solid #30363d",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#0d1117",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #30363d",
                        backgroundColor: "#161b22",
                        color: "#8b949e",
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>


                        <span>📄 {selectedFile.path}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {isOwner && !editingFile && (
                                <button
                                    onClick={() => { setEditingFile(selectedFile); setEditContent(selectedFile.content || ""); }}
                                    style={{ ...actionBtnStyle("#1f6feb"), opacity: 1 }}
                                >✏️ Edit</button>
                            )}
                            {editingFile && (
                                <>
                                    <button onClick={handleEditSave} disabled={saving}
                                        style={{ ...greenBtnStyle, padding: "3px 12px", fontSize: "12px" }}>
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditingFile(null)} style={cancelBtnStyle}>
                                        Cancel
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => { setSelectedFile(null); setEditingFile(null); }}
                                style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "16px" }}
                            >✕</button>
                        </div>
                    </div>

                    {/* Content or Editor */}
                    {editingFile?.id === selectedFile.id ? (
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            style={{
                                width: "100%",
                                minHeight: "300px",
                                backgroundColor: "#0d1117",
                                color: "#c9d1d9",
                                border: "none",
                                padding: "1rem",
                                fontFamily: "monospace",
                                fontSize: "14px",
                                resize: "vertical",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    ) : (
                        <pre style={{
                            padding: "1rem",
                            color: "#c9d1d9",
                            fontSize: "14px",
                            overflowX: "auto",
                            margin: 0,
                            fontFamily: "monospace",
                        }}>
                            {selectedFile.content || "Empty file"}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Shared styles ────────────────────────────────────────────
const actionBtnStyle = (borderColor, bg = "transparent") => ({
    opacity: 0,
    transition: "opacity 0.15s",
    background: bg,
    border: `1px solid ${borderColor}66`,
    borderRadius: "6px",
    color: borderColor,
    fontSize: "12px",
    padding: "2px 8px",
    cursor: "pointer",
});

const inputStyle = {
    flex: 1,
    padding: "6px 10px",
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "white",
    fontSize: "13px",
    outline: "none",
    width: "100%",
};

const greenBtnStyle = {
    padding: "6px 14px",
    backgroundColor: "#238636",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
};

const cancelBtnStyle = {
    padding: "6px 14px",
    backgroundColor: "transparent",
    color: "#c9d1d9",
    border: "1px solid #30363d",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
};

export default FileTree;