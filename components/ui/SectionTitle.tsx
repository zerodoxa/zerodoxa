type Props = {
  badge?: string;
  title: string;
  subtitle: string;
};

export default function SectionTitle({
  badge,
  title,
  subtitle,
}: Props) {
  return (
    <div className="mx-auto mb-12 max-w-3xl px-2 text-center sm:mb-16 sm:px-0">
      {badge && (
        <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          {badge}
        </span>
      )}

      <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>

      <p className="mt-4 text-base leading-7 text-gray-400 sm:mt-6 sm:text-lg">
        {subtitle}
      </p>
    </div>
  );
}