import { PagesInterface } from "src/shared/interfaces/pages.interfaces";

const pagination = (page: number,limit:number,total:number):PagesInterface =>{
    const next=page+1;
    const prev = page-1;
    const totalPages = Math.ceil(total/limit);
    const hasNext = page<totalPages
    const hasPrev = page>1
    return {
        total,
        totalPages,
        currentPage:page,
        next,
        prev,
        hasNext,
        hasPrev
    }
}
export default pagination