import { Tooltip } from '@nextui-org/tooltip';

interface ActivityTypeButtonProps {
  type: string;
  config: {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export function ActivityTypeButton({ type, config, isSelected, onClick }: ActivityTypeButtonProps) {
  const Icon = config.icon;
  
  return (
    <Tooltip 
      content={config.description}
      delay={0}
      closeDelay={0}
    >
      <button
        onClick={onClick}
        className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs
          ${isSelected 
            ? `${config.bgColor} ${config.iconColor}` 
            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
          }
        `}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </button>
    </Tooltip>
  );
} 