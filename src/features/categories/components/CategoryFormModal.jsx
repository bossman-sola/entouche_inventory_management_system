import { useEffect, useState } from "react"

const emptyForm = { name: "", code: "", parent_id: "", status: "active" }

function CategoryFormModal({ open, onClose, onSubmit, categories, editingCategory }) {
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || "",
        code: editingCategory.code || "",
        parent_id: editingCategory.parent_id ?? "",
        status: editingCategory.status || "active",
      })
    } else {
      setForm(emptyForm)
    }
    setError(null)
  }, [editingCategory, open])

  if (!open) return null

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: form.name,
        code: form.code,
        parent_id: form.parent_id === "" ? null : Number(form.parent_id),
        status: form.status,
      })
      onClose()
    } catch (err) {
      const validationErrors = err.response?.data?.errors
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null
      setError(firstError || err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingCategory ? "Edit category" : "New category"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange("name")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={handleChange("code")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parent category</label>
            <select
              value={form.parent_id}
              onChange={handleChange("parent_id")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">None</option>
              {categories
                .filter((c) => c.id !== editingCategory?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingCategory ? "Save changes" : "Create category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryFormModal