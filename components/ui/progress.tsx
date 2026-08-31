import React from "react"
export const Input = (p:any)=><input {...p} style={{padding:"8px",borderRadius:"4px",border:"1px solid #333",...p.style}}/>
export const Select = ({children,...p}:any)=><select {...p}>{children}</select>
export const SelectTrigger = ({children,...p}:any)=><div {...p}>{children}</div>
export const SelectContent = ({children,...p}:any)=><div {...p}>{children}</div>
export const SelectItem = ({value,children,...p}:any)=><option value={value} {...p}>{children}</option>
export const SelectValue = ({placeholder,...p}:any)=><span {...p}>{placeholder}</span>
export const Progress = ({value,...p}:any)=><progress value={value} max={100} {...p} style={{width:"100%",...p.style}}/>
