import type { SVGProps } from "react";

const CodesandboxSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 600 600">
    <path
      fill="#DCFF50"
      fillRule="evenodd"
      d="M150 150h299.832v300H150V150Zm269.168 30.682v238.636H180.665V180.682h238.503Z"
      clipRule="evenodd"
    />
  </svg>
);

export { CodesandboxSquare };
