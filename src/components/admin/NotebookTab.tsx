"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bold, Italic, Underline, Type, Table as TableIcon, Download, List, Save 
} from "lucide-react";
import toast from "react-hot-toast";

export default function NotebookTab() {
  const [managerNotes, setManagerNotes] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  // --- FETCH NOTES ---
  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase.from('admin_settings').select('manager_notes').eq('id', 1).single();
      if (data?.manager_notes) {
          setManagerNotes(data.manager_notes);
          if(editorRef.current) editorRef.current.innerHTML = data.manager_notes;
      }
    };
    fetchNotes();
  }, []);

  // --- HANDLERS ---
  const saveSettingsToDB = async () => {
      const { error } = await supabase.from('admin_settings').update({
          manager_notes: managerNotes
      }).eq('id', 1);

      if (error) toast.error("Failed to save notes");
      else toast.success("Notes Saved Successfully!");
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if(editorRef.current) setManagerNotes(editorRef.current.innerHTML);
  };

  const saveFile = () => {
      const element = document.createElement("a");
      const file = new Blob([managerNotes], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = "AuraX_Notes.html";
      document.body.appendChild(element);
      element.click();
  };

  const insertTable = () => {
      const html = '<table border="1" style="width:100%; border-collapse: collapse; margin: 10px 0;"><tr><td style="padding: 5px;">Head 1</td><td style="padding: 5px;">Head 2</td></tr><tr><td style="padding: 5px;">Data 1</td><td style="padding: 5px;">Data 2</td></tr></table><br/>';
      execCmd('insertHTML', html);
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col pb-20">
        <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Manager's Notebook</h1>
            <div className="flex gap-2">
                <button onClick={saveFile} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-2"><Download size={16}/> Save File</button>
                <button onClick={saveSettingsToDB} className="bg-aura-brown text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-aura-gold transition-colors flex items-center gap-2"><Save size={16}/> Save DB</button>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden max-w-[100vw]">
            {/* Toolbar */}
            <div className="border-b p-3 flex gap-2 bg-gray-50 overflow-x-auto scrollbar-hide">
                <button onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="Bold"><Bold size={18}/></button>
                <button onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="Italic"><Italic size={18}/></button>
                <button onClick={() => execCmd('underline')} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="Underline"><Underline size={18}/></button>
                <div className="w-[1px] bg-gray-300 h-6 my-auto mx-2"></div>
                <button onClick={() => execCmd('formatBlock', 'H2')} className="p-2 hover:bg-gray-200 rounded font-bold min-w-[40px]" title="Heading">H1</button>
                <button onClick={() => execCmd('formatBlock', 'H3')} className="p-2 hover:bg-gray-200 rounded font-bold text-sm min-w-[40px]" title="Subheading">H2</button>
                <div className="w-[1px] bg-gray-300 h-6 my-auto mx-2"></div>
                <button onClick={insertTable} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="Insert Table"><TableIcon size={18}/></button>
                <button onClick={() => execCmd('fontSize', '3')} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="Normal Text"><Type size={18}/></button>
                <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded min-w-[40px]" title="List"><List size={18}/></button>
            </div>
            {/* Editor Area */}
            <div 
                ref={editorRef}
                contentEditable 
                className="flex-1 p-8 outline-none overflow-y-auto prose max-w-none bg-white"
                onInput={(e) => setManagerNotes(e.currentTarget.innerHTML)}
                style={{ minHeight: '300px' }}
            ></div>
        </div>
    </div>
  );
}