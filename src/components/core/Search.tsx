import { getCollection } from "astro:content";
import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js";
import { useState, useMemo, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Search as SearchIcon } from "lucide-react";

import type { DocsEntry } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";

const docs: DocsEntry[] = await getCollection("docs");

const options: IFuseOptions<DocsEntry> = {
  includeScore: true,
  threshold: 0.5,
  location: 0,
  distance: 100,
  includeMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  findAllMatches: true,
  keys: [
    { name: "id", weight: 2.5 },
    { name: "slug", weight: 2.5 },
    { name: "body", weight: 1.5 },
    {
      name: "title",
      weight: 2,
      getFn: (docs: DocsEntry) => docs.data.title,
    },
    {
      name: "description",
      weight: 1.75,
      getFn: (docs: DocsEntry) => docs.data.description || "",
    },
  ],
};

export function Search() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const fuse: Fuse<DocsEntry> = useMemo(() => new Fuse(docs, options), [docs]);
  const results: FuseResult<DocsEntry>[] = useMemo(
    () => fuse.search(searchValue),
    [fuse, searchValue],
  );
  console.log(fuse);
  console.log(results);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost">
            <SearchIcon className="w-[1.2rem] h-[1.2rem]" />
          </Button>
        </DialogTrigger>
        <DialogContent className=" md:h-1/2 md:mx-0 w-full h-full ">
          <DialogHeader>
            <DialogTitle hidden={true}>Search</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-6">
                <Input
                  placeholder="Search ..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                {results.length > 0 && (
                  <ScrollArea className="mt-4 h-auto">
                    <ul className="list-none m-0">
                      {results.map(({ item, refIndex }) => (
                        <li
                          className=" px-4 m-0 py-2 flex flex-row items-center hover:bg-secondary hover:rounded hover:text-secondary-foreground"
                          key={refIndex}
                        >
                          <a href={item.slug} key={refIndex}>
                            {item.data.title
                              ? capitalizeFirstLetter(item.data.title)
                              : capitalizeFirstLetter(item.slug.split("/")[-1])}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
