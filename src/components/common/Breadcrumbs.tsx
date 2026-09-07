import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export interface BreadcrumbItem { label: string; href?: string }
interface BreadcrumbsProps { items: BreadcrumbItem[] }
export function Breadcrumbs({ items }: BreadcrumbsProps) { return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-1">{index > 0 && <ChevronRight size={13} />}{item.href && index < items.length - 1 ? <Link to={item.href} className="hover:text-[#187e8d]">{item.label}</Link> : <span className={index === items.length - 1 ? 'font-medium text-slate-700' : ''}>{item.label}</span>}</li>)}</ol></nav> }