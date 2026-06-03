'use client';

import { useState, useMemo, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { Letter } from '../types';
import { deleteLetter, markLetterRead } from '../actions';
import { CartasSidebar } from './CartasSidebar';
import { CartasReader } from './CartasReader';
import { CartasComposer } from './CartasComposer';
import { useToast } from '@/hooks/useToast';
import { useLoading } from '@/hooks/useLoading';

interface CartasAppProps {
  initialLetters: Letter[];
  currentUserName: string;
}

export function CartasApp({ initialLetters, currentUserName }: CartasAppProps) {
  const [letters, setLetters] = useState(initialLetters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'from' | 'to'>('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const toast = useToast();
  const loading = useLoading();
  const router = useRouter();

  const filteredLetters = useMemo(() => {
    let result = letters;
    if (activeTab === 'unread') result = result.filter(l => l.unread);
    if (activeTab === 'from') result = result.filter(l =>
      l.from_name === currentUserName
    );
    if (activeTab === 'to') result = result.filter(l =>
      l.to_name === currentUserName
    );
    const q = deferredSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(l =>
        l.subject.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.from_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [letters, activeTab, deferredSearch]);

  const selectedLetter = useMemo(
    () => letters.find(l => l.id === selectedId) ?? null,
    [letters, selectedId]
  );

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    const letter = letters.find(l => l.id === id);
    if (letter?.unread) {
      setLetters(prev => prev.map(l => l.id === id ? { ...l, unread: false } : l));
      await markLetterRead(id);
      router.refresh();
    }
  };

  const handleBack = () => setSelectedId(null);

  const handleSaved = (letter?: Letter) => {
    setShowComposer(false);
    setEditingLetter(null);
    if (letter) {
      toast.success('Carta guardada');
      setLetters(prev => {
        const exists = prev.find(l => l.id === letter.id);
        if (exists) return prev.map(l => (l.id === letter.id ? letter : l));
        return [letter, ...prev];
      });
      setSelectedId(letter.id);
    }
    router.refresh();
  };

  const handleEdit = (letter: Letter) => {
    if (letter.from_name !== currentUserName) return;
    setEditingLetter(letter);
    setShowComposer(true);
  };

  const handleDelete = async (id: string) => {
    const letter = letters.find(l => l.id === id);
    if (letter && letter.from_name !== currentUserName) return;
    loading.show('Eliminando...');
    try {
      const result = await deleteLetter(id);
      if (result.success) toast.success('Carta eliminada');
      else toast.error('No se pudo eliminar');
      setLetters(prev => prev.filter(l => l.id !== id));
      if (selectedId === id) setSelectedId(null);
      router.refresh();
    } catch {
      toast.error('Algo salió mal, intenta de nuevo');
    } finally {
      loading.hide();
    }
  };

  const hasSelectedOnMobile = !!selectedId;
  const layoutClass = `cartas-layout${hasSelectedOnMobile ? ' letter-open' : ''}`;

  return (
    <div className="page active" style={{ padding: 0 }}>
      <div className={layoutClass}>
        <CartasSidebar
          letters={filteredLetters}
          selectedId={selectedId}
          activeTab={activeTab}
          search={search}
          onSelect={handleSelect}
          onTabChange={setActiveTab}
          onSearchChange={setSearch}
          onNewLetter={() => { setEditingLetter(null); setShowComposer(true); }}
        />
        <CartasReader
          letter={selectedLetter}
          currentUserName={currentUserName}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      </div>

      {showComposer && (
        <CartasComposer
          editLetter={editingLetter}
          currentUserName={currentUserName}
          onClose={() => { setShowComposer(false); setEditingLetter(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
