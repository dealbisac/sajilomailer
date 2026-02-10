'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, Heading2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EditorProps {
  value: string
  onChange: (html: string) => void
  variables: string[]
}

export default function TiptapEditor({ value, onChange, variables }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your email here... Type % to see variables or use the menu.',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false, // Important for SSR to avoid hydration issues
  })

  if (!editor) {
    return null
  }

  const insertVariable = (variable: string) => {
    editor.chain().focus().insertContent(`%${variable}% `).run()
  }

  return (
    <div className="flex flex-col gap-2 border rounded-md p-2 bg-white">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-wrap gap-1 border-b pb-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        
        {/* --- VARIABLE INSERTER --- */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                {'{ }'} Insert Variable
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {variables.length === 0 ? (
                <DropdownMenuItem disabled>No CSV loaded</DropdownMenuItem>
              ) : (
                variables.map((v) => (
                  <DropdownMenuItem key={v} onClick={() => insertVariable(v)}>
                    {v}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- EDITOR AREA --- */}
      <EditorContent editor={editor} />
    </div>
  )
}