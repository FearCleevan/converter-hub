import type { ConverterCategory } from "@/types/converter.types";

interface CategoryIconProps {
  category: ConverterCategory;
  size?: number;
  className?: string;
}

// Each SVG uses currentColor so it inherits whatever text-* class is set on the parent.
const ICONS: Record<ConverterCategory, (size: number) => JSX.Element> = {
  image: (s) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <g fill="currentColor" fillRule="evenodd">
        <path d="M11.083,10.667 C12.188,10.667 13.083,9.772 13.083,8.667 C13.083,7.562 12.188,6.667 11.083,6.667 C9.979,6.667 9.083,7.562 9.083,8.667 C9.083,9.772 9.979,10.667 11.083,10.667 Z M2,18 L3.956,18 L6.824,14.882 L3.594,11.402 L2,12.996 L2,18 Z M2,10.167 L3.578,8.589 L3.594,8.605 L3.61,8.589 L8.238,13.218 L9.669,11.787 L9.685,11.803 L9.701,11.787 L14,16.086 L14,6 L2,6 L2,10.167 Z M12.586,18 L9.685,15.099 L6.784,18 L12.586,18 Z M0,20 L16,20 L16,4 L0,4 L0,20 Z M20,0 L20,16 L18,16 L18,2 L4,2 L4,0 L20,0 Z" />
      </g>
    </svg>
  ),

  document: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.293 1.293A1 1 0 0110 1h8a3 3 0 013 3v16a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 01.293-.707l6-6zM18 3h-7v5a1 1 0 01-1 1H5v11a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1zM6.414 7H9V4.414L6.414 7zM7 13a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z"
        fill="currentColor"
      />
    </svg>
  ),

  video: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12.5 13V9M12.5 9H8.5M12.5 9L6.5 15M16 10l2.577-1.546c.793-.476 1.19-.714 1.516-.683.284.026.544.173.713.404C21 8.438 21 8.9 21 9.826v4.348c0 .925 0 1.387-.194 1.652a1 1 0 01-.713.403c-.326.03-.723-.208-1.516-.684L16 14M6.2 18h6.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C16 16.48 16 15.92 16 14.8V9.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C14.48 6 13.92 6 12.8 6H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C3 7.52 3 8.08 3 9.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C4.52 18 5.08 18 6.2 18z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  audio: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 10.171V0h12v6H6v7c0 1.657-1.347 3-3 3-1.657 0-3-1.347-3-3a3.002 3.002 0 014-2.829zM4 12H2v2h2v-2zM6 2v2h8V2H6zm8 6.171V6h2v5c0 1.657-1.347 3-3 3-1.657 0-3-1.347-3-3a3.002 3.002 0 014-2.829zM14 10h-2v2h2v-2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),

  spreadsheet: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9.5H21M3 14.5H21M8 4.5V19.5M6.2 19.5h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C21 17.98 21 17.42 21 16.3V7.7c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C19.48 4.5 18.92 4.5 17.8 4.5H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C3 6.02 3 6.58 3 7.7v8.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C4.52 19.5 5.08 19.5 6.2 19.5z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  presentation: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.958 1.713A1 1 0 0012 1a1 1 0 00-.958.713L10.656 3H4a3 3 0 00-3 3v10a3 3 0 003 3h1.856l-.814 2.713a1 1 0 001.913.574L7.944 19h8.112l.986 3.287a1 1 0 101.914-.574L18.144 19H20a3 3 0 003-3V6a3 3 0 00-3-3h-6.656l-.386-1.287zM3 6a1 1 0 011-1h7.4 1.2H20a1 1 0 011 1v10a1 1 0 01-1 1H16.8h-9.6H4a1 1 0 01-1-1V6zm7.894.83a1 1 0 00-1.552.84v4.763a1 1 0 001.553.833l4.764-2.382a1 1 0 000-1.789L10.894 6.83zM10 8.618L14.764 11 10 13.382V8.618z"
        fill="currentColor"
      />
    </svg>
  ),

  ebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 50.424 50.425" fill="none" aria-hidden="true">
      <path
        d="M50.337,18.689V4.231C50.337,1.895,48.442,0,46.106,0H10.471v33.854h3.643c0,0,0,2.744,0,4.392c0,1.646,0.987,2.507,2.204,1.923c1.217-0.584,3.151-0.584,4.32,0c1.168,0.584,2.116-0.277,2.116-1.923v-4.392h17.808c5.642,0,5.114-3.281,5.819-3.526c1.195-0.415,1.165,3.954,1.165,6.292v6.755c0,2.338-1.896,4.231-4.231,4.231H7.111c-2.337,0-4.232-1.895-4.232-4.231v-5.29c0-2.338,1.895-4.23,4.232-4.23H7.65V0H4.318C1.981,0,0.087,1.896,0.087,4.231v22.746c0,2.336-0.015,6.127-0.019,8.463c-0.006,3.194-0.008,7.562-0.009,10.756c0,2.338,1.894,4.229,4.231,4.229h41.844c2.337,0,4.231-1.896,4.231-4.231c-0.002-5.172-0.004-13.871-0.013-19.043C50.35,24.813,50.337,21.026,50.337,18.689z"
        fill="currentColor"
      />
    </svg>
  ),

  archive: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M16 2H0V5H16V2Z" fill="currentColor" />
      <path d="M1 7H5V9H11V7H15V15H1V7Z" fill="currentColor" />
    </svg>
  ),

  vector: (s) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.752 6.146a6.001 6.001 0 00-4.898-4.898A2 2 0 008 0a2 2 0 00-1.854 1.248 6.001 6.001 0 00-4.898 4.898A2 2 0 000 8a2 2 0 001.248 1.854 6.001 6.001 0 004.898 4.898A2 2 0 008 16a2 2 0 001.854-1.248 6.001 6.001 0 004.898-4.898A2 2 0 0016 8a2 2 0 00-1.248-1.854zM9.562 12.751A4.001 4.001 0 0012.751 9.562 2 2 0 0112 8a2 2 0 00.751-1.562 4.001 4.001 0 00-3.189-3.189A2 2 0 008 4a2 2 0 00-1.562-.751 4.001 4.001 0 00-3.189 3.189A2 2 0 004 8a2 2 0 00-.751 1.562 4.001 4.001 0 003.189 3.189A2 2 0 008 12a2 2 0 001.562.751z"
        fill="currentColor"
      />
    </svg>
  ),

  cad: (s) => (
    <svg width={s} height={s} viewBox="0 0 512 512" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M457.832,418.164L128.831,511.5L63.499,308.497L19.163,42.5l312.67-42l161.004,123.667L457.832,418.164z M133.499,383.169l100.335-25.668l-25.668-49.004l-93.335,21.005L133.499,383.169z M103.163,240.83l98.003-20.996l25.668,46.664l109.668-23.332l-67.668-84.004L84.499,191.835L103.163,240.83z M324.833,30.832l-272.997,35l18.663,42l195.999-28l72.335,72.336l114.336-18.668L324.833,30.832z"
        fill="currentColor"
      />
    </svg>
  ),

  font: (s) => (
    <svg width={s} height={s} viewBox="0 0 512 512" fill="none" aria-hidden="true">
      <path
        d="M221.631 109L109.92 392h58.055l24.079-61H319.946l24.079 61H402.08L290.369 109H221.631zM213.37 277L256 169l42.63 108H213.37z"
        fill="currentColor"
      />
      <path
        d="M16 496h480V16H16v480zm32-448h416v416H48V48z"
        fill="currentColor"
      />
    </svg>
  ),

  "code-data": (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8L3 11.692L7 16M17 8L21 11.692L17 16M14 4L10 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  hash: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 21L17 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 21L11 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 9L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function CategoryIcon({ category, size = 20, className = "" }: CategoryIconProps) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {ICONS[category]?.(size)}
    </span>
  );
}
