import { CreateBackgroundTileClasses, CreateBackgroundTileGradients } from '@/components/dashboard/create/constants';

export function CreateBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_30%),linear-gradient(180deg,rgba(9,10,14,0.2),rgba(9,10,14,0.78))]" />
      <div className="absolute inset-x-0 top-0 h-[20rem] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.1),transparent_62%)] blur-3xl md:h-[32rem]" />
      <div className="absolute inset-0 md:hidden bg-[linear-gradient(135deg,rgba(45,212,191,0.08),transparent_45%,rgba(168,85,247,0.06))]" />
      <div className="hidden h-full grid-cols-3 gap-3 p-3 md:grid md:grid-cols-5 md:gap-4 md:p-6">
        {TileCards.map((tile) => (
          <div
            key={tile.id}
            className={tile.className}
            style={{
              backgroundImage: tile.backgroundImage,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const TileCards = CreateBackgroundTileClasses.map((className, index) => ({
  id: `${index}`,
  className,
  backgroundImage: CreateBackgroundTileGradients[index % CreateBackgroundTileGradients.length],
}));
