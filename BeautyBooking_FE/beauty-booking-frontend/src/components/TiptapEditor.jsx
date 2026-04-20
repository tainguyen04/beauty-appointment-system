import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button, Space, Divider } from 'antd'; // Dùng Ant Design cho đồng bộ
import { useEffect } from 'react';
import { BoldOutlined, ItalicOutlined, OrderedListOutlined, UnorderedListOutlined } from '@ant-design/icons';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <Space style={{ marginBottom: 10, padding: '5px', border: '1px solid #d9d9d9', borderRadius: '4px', width: '100%', background: '#fafafa' }}>
      <Button 
        type={editor.isActive('bold') ? 'primary' : 'default'}
        icon={<BoldOutlined />} 
        onClick={() => editor.chain().focus().toggleBold().run()} 
      />
      <Button 
        type={editor.isActive('italic') ? 'primary' : 'default'}
        icon={<ItalicOutlined />} 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
      />
      <Button 
        type={editor.isActive('bulletList') ? 'primary' : 'default'}
        icon={<UnorderedListOutlined />} 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
      />
      <Button 
        type={editor.isActive('orderedList') ? 'primary' : 'default'}
        icon={<OrderedListOutlined />} 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
      />
      {/* Thêm các nút khác tùy ý... */}
    </Space>
  );
};

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      // Gửi HTML về cho Ant Design Form
      onChange(editor.getHTML());
    },
  });

  // Khi Form reset hoặc setFieldsValue từ bên ngoài
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [value, editor]);

  return (
    <div className="admin-tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} style={{ border: '1px solid #d9d9d9', borderRadius: '4px', padding: '10px', minHeight: '200px' }} />
    </div>
  );
};

export default TiptapEditor;