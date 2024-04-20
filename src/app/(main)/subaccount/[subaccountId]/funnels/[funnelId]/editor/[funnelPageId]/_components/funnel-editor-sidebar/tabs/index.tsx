import { Database, Plus, SettingsIcon, SquareStackIcon } from 'lucide-react';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TabList = () => {
  return (
    <TooltipProvider>
      <TabsList className="flex items-center flex-col justify-evenly w-full bg-transparent h-fit gap-4">
        <Tooltip>
          <TooltipTrigger>
            <TabsTrigger
              value="Settings"
              className="w-10 h-10 p-0 data-[state=active]:bg-muted hover:bg-muted"
            >
              <SettingsIcon />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <TabsTrigger
              value="Components"
              className="w-10 h-10 p-0 data-[state=active]:bg-muted hover:bg-muted"
            >
              <Plus />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Components</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <TabsTrigger
              value="Layers"
              className="w-10 h-10 p-0 data-[state=active]:bg-muted hover:bg-muted"
            >
              <SquareStackIcon />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Layers</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <TabsTrigger
              value="Media"
              className="w-10 h-10 p-0 data-[state=active]:bg-muted hover:bg-muted"
            >
              <Database />
            </TabsTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Media</p>
          </TooltipContent>
        </Tooltip>
      </TabsList>
    </TooltipProvider>
  );
};

export default TabList;
