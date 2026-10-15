"use client";
import { T } from "@/lib/i18n/provider";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Breadcrumbs, PageHeader } from "@/components/layout/page-header";
import { Badge, Button, Card, Field, Input, Textarea } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/feedback";
import { projectsApi } from "@/lib/api/modules";
import { formatDate } from "@/lib/utils";
import { useTranslatedText } from "@/lib/i18n/content";
const schema=z.object({title:z.string().trim().min(1,"Name is required").max(120),description:z.string().max(1000)}); type Form=z.infer<typeof schema>;
function ProjectDetail({id}:{id:string}) { const qc=useQueryClient(), toast=useToast(); const query=useQuery({queryKey:["project",id],queryFn:({signal})=>projectsApi.get(id,signal)}); const title=useTranslatedText(query.data?.title).text; const form=useForm<Form>({resolver:zodResolver(schema),defaultValues:{title:"",description:""}}); useEffect(()=>{if(query.data)form.reset({title:query.data.title,description:String(query.data.data.description||"")})},[query.data,form]); const save=useMutation({mutationFn:(values:Form)=>projectsApi.update(id,values),onSuccess:()=>{qc.invalidateQueries({queryKey:["project",id]});qc.invalidateQueries({queryKey:["projects"]});toast.push("Project updated.")},onError:(error)=>toast.push(error.message,"error")}); return <><Breadcrumbs items={[{label:"Projects",href:"/dashboard/projects"},{label:title||"Project"}]}/>{query.isPending?<LoadingState/>:query.error?<ErrorState message={query.error.message} retry={()=>query.refetch()}/>:<><PageHeader eyebrow="Project details" title={title} description="Update the information for this project." action={<Badge tone={query.data.status==="active"?"success":"neutral"}><T text={query.data.status}/></Badge>}/><div className="grid gap-6 lg:grid-cols-[1fr_20rem]"><Card className="p-6"><h2 className="text-lg font-bold"><T text={"Project information"} /></h2><form onSubmit={form.handleSubmit((values)=>save.mutate(values))} className="mt-5 space-y-5"><Field label="Project name" error={form.formState.errors.title?.message}><Input {...form.register("title")}/></Field><Field label="Description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")}/></Field><Button type="submit" loading={save.isPending} disabled={!form.formState.isDirty}><T text={"Save changes"} /></Button></form></Card><Card className="h-fit p-6"><h2 className="font-bold"><T text={"Details"} /></h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-muted"><T text={"Created"} /></dt><dd className="mt-1 font-medium">{formatDate(query.data.created_at)}</dd></div><div><dt className="text-muted"><T text={"Last updated"} /></dt><dd className="mt-1 font-medium">{formatDate(query.data.updated_at)}</dd></div><div><dt className="text-muted"><T text={"Status"} /></dt><dd className="mt-1 font-medium capitalize"><T text={query.data.status}/></dd></div></dl></Card></div></>}</>; }
function ProjectDetailFromQuery() { const id=useSearchParams().get("id"); if(!id) return <ErrorState message="Project not found." />; return <ProjectDetail id={id}/>; }
export default function ProjectDetailPage() { return <Suspense fallback={<LoadingState/>}><ProjectDetailFromQuery/></Suspense>; }
