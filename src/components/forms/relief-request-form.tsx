import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  reliefRequestSchema,
  disasterTypes,
  reliefTypes,
  priorities,
} from "@/schemas/relief-request.schema";
import type { z } from "zod";

type ReliefRequestInput = z.infer<typeof reliefRequestSchema>;

interface ReliefRequestFormProps {
  onSubmit: (data: ReliefRequestInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function ReliefRequestForm({
  onSubmit,
  isSubmitting,
}: ReliefRequestFormProps) {
  const form = useForm<ReliefRequestInput>({
    resolver: zodResolver(reliefRequestSchema),
    defaultValues: {
      disaster_type: undefined,
      ward_number: undefined as unknown as number,
      location_details: "",
      damage_description: "",
      relief_type: undefined,
      priority: undefined,
    },
  });

  const handleSubmit = async (data: ReliefRequestInput) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Relief Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="disaster_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disaster Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select disaster type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disasterTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward Number (1-35)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={33}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || "")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed location information..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="damage_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the damage and current situation..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relief_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relief Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relief type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reliefTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
