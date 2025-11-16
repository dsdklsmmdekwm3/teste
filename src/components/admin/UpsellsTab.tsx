import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { Package, Sparkles, Save, Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Upsell {
  id: string;
  title: string;
  description: string;
  price: string;
  original_price: string;
  image_url: string;
  order: number;
  active: boolean;
}

interface UpsellsTabProps {
  upsells: Upsell[];
  onUpsellsChange: (upsells: Upsell[]) => void;
}

export function UpsellsTab({ upsells, onUpsellsChange }: UpsellsTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Criar upsells padrão se a tabela estiver vazia
  useEffect(() => {
    let isMounted = true;
    
    const initializeUpsells = async () => {
      if (upsells.length === 0) {
        setIsLoading(true);
        try {
          // Verificar se realmente não há upsells no banco
          const { data: existingUpsells, error: checkError } = await supabase
            .from('upsell_config' as any)
            .select('*')
            .order('order', { ascending: true });
          
          if (checkError) {
            console.error('Error checking upsells:', checkError);
            if (isMounted) {
              setIsLoading(false);
              toast({
                description: "Erro ao carregar upsells",
                variant: "destructive",
              });
            }
            return;
          }

          if (!isMounted) return;

          // Se não houver upsells, criar um padrão
          if (!existingUpsells || existingUpsells.length === 0) {
            const defaultUpsell = {
              title: 'Oferta Especial: Consultoria Individual 1h',
              description: 'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado. Acompanhamento contínuo, ajustes semanais e acesso vitalício enquanto mantiver sua vaga.',
              price: '197,00',
              original_price: '297,00',
              image_url: 'https://via.placeholder.com/80x80',
              order: 1,
              active: true
            };

            const { data: newUpsell, error: insertError } = await supabase
              .from('upsell_config' as any)
              .insert(defaultUpsell as any)
              .select()
              .single();

            if (insertError) {
              console.error('Error creating default upsell:', insertError);
              if (isMounted) {
                toast({
                  description: "Erro ao criar upsell padrão",
                  variant: "destructive",
                });
                setIsLoading(false);
              }
            } else if (newUpsell && isMounted) {
              onUpsellsChange([newUpsell as Upsell]);
              setIsLoading(false);
              toast({
                description: "Upsell padrão criado",
              });
            }
          } else {
            // Se houver upsells no banco mas não no estado, atualizar o estado
            if (isMounted) {
              onUpsellsChange(existingUpsells as Upsell[]);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('Error initializing upsells:', error);
          if (isMounted) {
            toast({
              description: "Erro ao carregar upsells",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeUpsells();

    return () => {
      isMounted = false;
    };
  }, []); // Executar apenas uma vez ao montar

  const handleToggleActive = async (upsellId: string, currentActive: boolean) => {
    try {
      const newActiveState = !currentActive;
      
      // Atualizar estado local primeiro para feedback imediato
      const updatedUpsells = upsells.map(u => 
        u.id === upsellId ? { ...u, active: newActiveState } : u
      );
      onUpsellsChange(updatedUpsells);
      
      const { data, error } = await supabase
        .from('upsell_config' as any)
        .update({ active: newActiveState } as any)
        .eq('id', upsellId)
        .select()
        .single();

      if (error) {
        // Reverter se houver erro
        const revertedUpsells = upsells.map(u => 
          u.id === upsellId ? { ...u, active: currentActive } : u
        );
        onUpsellsChange(revertedUpsells);
        throw error;
      }

      // Atualizar com dados do banco para garantir sincronização
      if (data) {
        const syncedUpsells = upsells.map(u => 
          u.id === upsellId ? { ...u, ...(data as Upsell) } : u
        );
        onUpsellsChange(syncedUpsells);
      }

      toast({
        description: `Upsell ${newActiveState ? 'ativado' : 'desativado'}`,
      });
    } catch (error) {
      console.error('Error toggling upsell:', error);
      toast({
        description: "Erro ao alterar status",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (upsellId: string, file: File) => {
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, [upsellId]: true }));

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${upsellId}-${Date.now()}.${fileExt}`;
      const filePath = `upsells/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('upsells')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Se o bucket não existir, criar e tentar novamente
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            description: "Criando bucket... Tente novamente em alguns segundos",
          });
          throw uploadError;
        }
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabaseClient.storage
        .from('upsells')
        .getPublicUrl(filePath);

      // Atualizar o upsell com a nova URL
      const upsellIndex = upsells.findIndex(u => u.id === upsellId);
      if (upsellIndex !== -1) {
        const updatedUpsells = [...upsells];
        updatedUpsells[upsellIndex].image_url = publicUrl;
        onUpsellsChange(updatedUpsells);
      }

      toast({
        description: "Imagem enviada com sucesso!",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        description: error.message || "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [upsellId]: false }));
    }
  };

  const handleUpdateUpsell = async (index: number, upsell: Upsell) => {
    try {
      const { data, error } = await supabase
        .from('upsell_config' as any)
        .update({
          title: upsell.title,
          description: upsell.description,
          price: upsell.price,
          original_price: upsell.original_price,
          image_url: upsell.image_url,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', upsell.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar o estado local com os dados retornados do banco
      if (data) {
        const updatedUpsells = [...upsells];
        updatedUpsells[index] = { ...data as Upsell };
        onUpsellsChange(updatedUpsells);
      }

      toast({
        description: `Oferta ${index + 1} salva`,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    }
  };

  const handleAddUpsell = async () => {
    try {
      const maxOrder = upsells.length > 0 
        ? Math.max(...upsells.map(u => u.order || 0)) 
        : 0;
      
      const newUpsell = {
        title: 'Nova Oferta Especial',
        description: 'Descrição da oferta especial',
        price: '0,00',
        original_price: '0,00',
        image_url: 'https://via.placeholder.com/200x200',
        order: maxOrder + 1,
        active: false
      };

      const { data, error } = await supabase
        .from('upsell_config' as any)
        .insert(newUpsell as any)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar upsell:', error);
        throw error;
      }

      if (data) {
        const updatedUpsells = [...upsells, data as Upsell];
        onUpsellsChange(updatedUpsells);
        toast({
          description: "Upsell criado",
        });
      }
    } catch (error: any) {
      console.error('Error adding upsell:', error);
      
      let errorMessage = "Não foi possível criar novo upsell.";
      
      if (error?.code === '42501') {
        errorMessage = "Erro de permissão: As políticas RLS não permitem INSERT. Execute o script SQL de correção de permissões.";
      } else if (error?.code === 'PGRST301') {
        errorMessage = "Erro de permissão: Verifique as políticas RLS no Supabase Dashboard.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        description: "Erro ao criar upsell",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUpsell = async (upsellId: string, index: number) => {
    if (!confirm(`Tem certeza que deseja excluir a Oferta ${index + 1}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('upsell_config' as any)
        .delete()
        .eq('id', upsellId);

      if (error) throw error;

      const updatedUpsells = upsells.filter(u => u.id !== upsellId);
      onUpsellsChange(updatedUpsells);

      toast({
        description: "Upsell excluído",
      });
    } catch (error) {
      console.error('Error deleting upsell:', error);
      toast({
        description: "Erro ao excluir",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">Carregando upsells...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Gerenciar Upsells</h3>
          <p className="text-sm text-gray-400">
            Configure as ofertas especiais que aparecerão no checkout
          </p>
        </div>
        <Button 
          onClick={handleAddUpsell} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Upsell
        </Button>
      </div>

      {upsells.length === 0 ? (
        <Card className="p-8 text-center bg-gray-900 border-gray-800">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhum upsell configurado
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Clique no botão acima para criar seu primeiro upsell
          </p>
          <Button 
            onClick={handleAddUpsell} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Upsell
          </Button>
        </Card>
      ) : (
        upsells.map((upsell, index) => (
        <Card key={upsell.id} className={`p-6 transition-all duration-300 bg-gray-900 border-gray-800 ${
          upsell.active 
            ? 'border-purple-600/50 shadow-lg' 
            : 'opacity-75'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${upsell.active ? 'bg-purple-600/20' : 'bg-gray-800'}`}>
                {upsell.active ? (
                  <Sparkles className={`h-5 w-5 ${upsell.active ? 'text-purple-400' : 'text-gray-500'}`} />
                ) : (
                  <Package className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Oferta Especial {index + 1}
                </h2>
                <p className="text-xs text-gray-400">
                  Ordem de exibição: {upsell.order}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                upsell.active 
                  ? 'bg-green-900/50 text-green-400 border border-green-800' 
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}>
                {upsell.active ? 'Ativa' : 'Inativa'}
              </span>
              <Switch
                checked={upsell.active}
                onCheckedChange={() => handleToggleActive(upsell.id, upsell.active)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`title-${index}`} className="text-sm font-medium text-gray-300">
                Título da Oferta
              </Label>
              <Input
                id={`title-${index}`}
                type="text"
                value={upsell.title}
                onChange={(e) => {
                  const newUpsells = [...upsells];
                  newUpsells[index].title = e.target.value;
                  onUpsellsChange(newUpsells);
                }}
                placeholder="Oferta Especial: Consultoria Individual 1h"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${index}`} className="text-sm font-medium text-gray-300">
                Descrição da Oferta
              </Label>
              <Input
                id={`description-${index}`}
                type="text"
                value={upsell.description}
                onChange={(e) => {
                  const newUpsells = [...upsells];
                  newUpsells[index].description = e.target.value;
                  onUpsellsChange(newUpsells);
                }}
                placeholder="Tenha 1 sessão por semana..."
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`price-${index}`} className="text-sm font-medium text-gray-300">
                Preço da Oferta (em reais)
              </Label>
              <Input
                id={`price-${index}`}
                type="text"
                value={upsell.price}
                onChange={(e) => {
                  const newUpsells = [...upsells];
                  newUpsells[index].price = e.target.value;
                  onUpsellsChange(newUpsells);
                }}
                placeholder="197,00"
                className="h-11 font-mono bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400">
                Use formato brasileiro com vírgula. Ex: 197,00 (será convertido para centavos no PIX)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`original-price-${index}`} className="text-sm font-medium text-gray-300">
                Preço Original (em reais)
              </Label>
              <Input
                id={`original-price-${index}`}
                type="text"
                value={upsell.original_price}
                onChange={(e) => {
                  const newUpsells = [...upsells];
                  newUpsells[index].original_price = e.target.value;
                  onUpsellsChange(newUpsells);
                }}
                placeholder="297,00"
                className="h-11 font-mono bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400">
                Preço riscado para comparação. Ex: 297,00
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`image-${index}`} className="text-sm font-medium text-gray-300">
                Imagem do Upsell
              </Label>
              
              <div className="flex gap-2">
                <input
                  ref={(el) => fileInputRefs.current[upsell.id] = el}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(upsell.id, file);
                    }
                  }}
                />
                
                <Button
                  type="button"
                  onClick={() => fileInputRefs.current[upsell.id]?.click()}
                  disabled={uploadingImages[upsell.id]}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  variant="outline"
                >
                  {uploadingImages[upsell.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Imagem
                    </>
                  )}
                </Button>
                
                <Input
                  id={`image-${index}`}
                  type="url"
                  value={upsell.image_url}
                  onChange={(e) => {
                    const newUpsells = [...upsells];
                    newUpsells[index].image_url = e.target.value;
                    onUpsellsChange(newUpsells);
                  }}
                  placeholder="Ou cole a URL da imagem"
                  className="flex-1 h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
                
                {upsell.image_url && (
                  <Button
                    type="button"
                    onClick={() => {
                      const newUpsells = [...upsells];
                      newUpsells[index].image_url = '';
                      onUpsellsChange(newUpsells);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    variant="destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Envie uma imagem ou cole a URL completa (ex: https://exemplo.com/imagem.jpg)
              </p>
            </div>
          </div>

          {upsell.image_url && (
            <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-800">
              <p className="text-xs text-gray-400 mb-2">Preview da imagem:</p>
              <img 
                src={upsell.image_url} 
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-gray-700"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/128x128?text=Erro";
                }}
              />
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button 
              onClick={() => handleUpdateUpsell(index, upsell)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Oferta {index + 1}
            </Button>
            <Button 
              onClick={() => handleDeleteUpsell(upsell.id, index)}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </Card>
        ))
      )}
    </div>
  );
}
