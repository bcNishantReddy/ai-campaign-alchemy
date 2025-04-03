
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProspectRequirements() {
  const requirements = [
    {
      id: 1,
      title: "Required Information",
      description: "The following information is required for each prospect:",
      items: [
        { text: "Contact's full name", required: true },
        { text: "Contact's email address", required: true },
        { text: "Company name", required: true },
        { text: "Contact's role/position (recommended)", required: false }
      ]
    },
    {
      id: 2,
      title: "Quality Guidelines",
      description: "For best results with AI-generated emails:",
      items: [
        { text: "Verify email addresses are valid", required: false },
        { text: "Use corporate email addresses when possible", required: false },
        { text: "Include decision-makers when possible", required: false },
        { text: "Target relevant departments for your product/service", required: false }
      ]
    }
  ];

  return (
    <Card className="max-h-[calc(100vh-2rem)] overflow-hidden">
      <CardHeader className="sticky top-0 z-10 bg-white">
        <CardTitle className="text-lg">Prospect Requirements</CardTitle>
        <CardDescription>
          Guidelines for adding prospects to your campaign
        </CardDescription>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <CardContent className="space-y-6">
          {requirements.map((section) => (
            <div key={section.id} className="space-y-3">
              <h3 className="font-medium text-base">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.description}</p>
              <ul className="space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.required ? (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm">
                      {item.text}
                      {item.required && <span className="text-amber-500 ml-1">*</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
