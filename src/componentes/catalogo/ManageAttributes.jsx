import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';
import { X } from 'lucide-react';

const ManageAttributes = ({ db, onDone }) => {
  const [allAttributes, setAllAttributes] = useState([]);
  const [currentAttribute, setCurrentAttribute] = useState(null); // The attribute being edited
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all attributes from Firestore when the component mounts
  useEffect(() => {
    const fetchAttributes = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'atributos_c'));
      const attributes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllAttributes(attributes);
      setIsLoading(false);
    };
    fetchAttributes();
  }, [db]);

  const handleSelectAttribute = (attribute) => {
    // Clone the attribute to avoid direct state mutation
    setCurrentAttribute({ ...attribute, options: [...attribute.options] });
  };

  const handleCreateNew = () => {
    setCurrentAttribute({ name: '', options: [] }); // Set up a new, empty attribute
  };

  // Callback to refresh the list when the editor saves/deletes
  const handleRefresh = async () => {
    const querySnapshot = await getDocs(collection(db, 'atributos_c'));
    setAllAttributes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setCurrentAttribute(null); // Reset the editor view
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Attributes</h2>
        <Button variant="ghost" onClick={onDone}>Close</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[60vh]">
        {/* Left Column: List of attributes */}
        <div className="md:col-span-1 flex flex-col border rounded-lg p-4">
          <Button onClick={handleCreateNew} className="mb-4">
            + Create New Attribute
          </Button>
          <ScrollArea className="flex-grow">
            {isLoading ? <p>Loading...</p> : allAttributes.map(attr => (
              <div
                key={attr.id}
                onClick={() => handleSelectAttribute(attr)}
                className={`p-3 rounded-md cursor-pointer text-sm ${currentAttribute?.id === attr.id ? 'bg-slate-700 font-semibold' : 'hover:bg-slate-800'}`}
              >
                {attr.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Right Column: Editor */}
        <div className="md:col-span-2 border rounded-lg p-4">
          {currentAttribute ? (
            <AttributeEditor 
              key={currentAttribute.id || 'new'} 
              db={db} 
              attribute={currentAttribute} 
              onSave={handleRefresh}
              onDelete={handleRefresh}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Select an attribute to edit or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for the editor form
const AttributeEditor = ({ db, attribute, onSave, onDelete }) => {
  const [name, setName] = useState(attribute.name);
  const [options, setOptions] = useState(attribute.options);
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption && !options.includes(newOption)) {
      setOptions([...options, newOption]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    setOptions(options.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    if (!name || options.length === 0) {
      alert("Name and at least one option are required.");
      return;
    }
    const data = { name, options, type: 'select' };
    if (attribute.id) { // Editing existing
      await updateDoc(doc(db, 'atributos_c', attribute.id), data);
    } else { // Creating new
      await addDoc(collection(db, 'atributos_c'), data);
    }
    onSave(); // Notify parent to refresh
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${attribute.name}"?`)) {
      await deleteDoc(doc(db, 'atributos_c', attribute.id));
      onDelete(); // Notify parent to refresh
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-4">
        <div>
          <label htmlFor="attr-name" className="text-sm font-medium">Attribute Name</label>
          <Input id="attr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Color" />
        </div>
        <div>
          <label className="text-sm font-medium">Options</label>
          <div className="p-2 border rounded-md min-h-[80px] space-x-2 space-y-2">
            {options.map((opt, index) => (
              <span key={index} className="inline-flex items-center bg-slate-700 rounded-full px-3 py-1 text-sm">
                {opt}
                <button onClick={() => handleRemoveOption(index)} className="ml-2 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input 
            value={newOption} 
            onChange={(e) => setNewOption(e.target.value)} 
            placeholder="Add new option" 
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
          />
          <Button type="button" variant="secondary" onClick={handleAddOption}>Add</Button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        {attribute.id && (
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        )}
        <div/> {/* Spacer */}
        <Button onClick={handleSave}>
          {attribute.id ? 'Save Changes' : 'Create Attribute'}
        </Button>
      </div>
    </div>
  );
};

export default ManageAttributes;