import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export const TiptapContent = ({ html }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html,
    editable: false, // Quan trọng: Khách chỉ xem, không sửa
  })

  // Cập nhật nội dung khi API trả về dữ liệu mới
  useEffect(() => {
    if (editor && html) {
      editor.commands.setContent(html)
    }
  }, [html, editor])

  return <EditorContent editor={editor} />
}
export const TiptapContentAdmin = ({ html }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html,
    editable: true, // Cho phép admin chỉnh sửa
  })    
  // Cập nhật nội dung khi API trả về dữ liệu mới
  useEffect(() => {
    if (editor && html) {
      editor.commands.setContent(html)
    }
  }, [html, editor])

  return <EditorContent editor={editor} />
}
