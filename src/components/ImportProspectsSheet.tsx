
import { useState } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Download } from "lucide-react";

interface ImportProspectsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ProspectData {
  name: string;
  email: string;
  company_name: string;
  role?: string;
}

export default function ImportProspectsSheet({ 
  isOpen, 
  onClose, 
  onImportComplete 
}: ImportProspectsSheetProps) {
  const { id: campaignId } = useParams<{ id: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ProspectData[]>([]);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Parse CSV file to preview
    Papa.parse(selectedFile, {
      header: hasHeaderRow,
      skipEmptyLines: true,
      complete: (results) => {
        const preview = results.data.slice(0, 5) as ProspectData[];
        setPreviewData(preview);
      }
    });
  };

  const handleImport = async () => {
    if (!file || !campaignId) return;
    
    setIsImporting(true);
    
    try {
      // Parse the CSV file fully
      Papa.parse(file, {
        header: hasHeaderRow,
        skipEmptyLines: true,
        complete: async (results) => {
          const prospects = results.data as ProspectData[];
          
          // Validate data
          const validProspects = prospects.filter(prospect => 
            prospect.name && prospect.email && prospect.company_name
          );
          
          if (validProspects.length === 0) {
            toast.error("No valid prospects found in the CSV file");
            setIsImporting(false);
            return;
          }
          
          // Prepare data for insert
          const prospectsToInsert = validProspects.map(prospect => ({
            campaign_id: campaignId,
            name: prospect.name,
            email: prospect.email,
            company_name: prospect.company_name,
            role: prospect.role || null
          }));
          
          // Insert into database
          const { error } = await supabase
            .from('prospects')
            .insert(prospectsToInsert);
            
          if (error) throw error;
          
          toast.success(`Successfully imported ${validProspects.length} prospects`);
          onImportComplete();
          onClose();
        },
        error: (error) => {
          throw new Error(`CSV parsing error: ${error.message}`);
        }
      });
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "name,email,company_name,role\nJohn Doe,john@example.com,Acme Inc.,CEO\nJane Smith,jane@example.com,XYZ Corp.,Marketing Director";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'prospect_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Import Prospects</SheetTitle>
          <SheetDescription>
            Upload a CSV file with your prospects' information.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">CSV Template</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={downloadTemplate}
            >
              <Download className="h-3 w-3 mr-1" />
              Download Template
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasHeader"
                checked={hasHeaderRow}
                onChange={() => setHasHeaderRow(!hasHeaderRow)}
                className="mr-2"
              />
              <label htmlFor="hasHeader" className="text-sm">
                CSV file has header row
              </label>
            </div>
            
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            
            {file && (
              <div className="border rounded-md p-3 bg-muted/50">
                <p className="text-sm font-medium">File: {file.name}</p>
                <p className="text-xs text-gray-500">Size: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>
          
          {previewData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview (first 5 rows):</h3>
              <div className="overflow-x-auto max-h-40 border rounded">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">{row.name || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.email || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.company_name || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.role || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {previewData.some(row => !row.name || !row.email || !row.company_name) && (
                <div className="flex items-start gap-2 text-amber-600 text-xs p-2 bg-amber-50 rounded border border-amber-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Some rows are missing required fields (name, email, or company_name). Only rows with all required fields will be imported.</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <SheetFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="mt-2 bg-brand-purple hover:bg-brand-purple/90"
          >
            {isImporting ? <Spinner size="sm" className="mr-2" /> : null}
            {isImporting ? "Importing..." : "Import Prospects"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
