import SvgIcon from "@material-ui/core/SvgIcon";
import { useTheme } from "@material-ui/core";
export default function Sushi(props) {
  const theme = useTheme();
  return (
    <SvgIcon
      {...props}
      fontSize="default"
      viewBox="0 0 121 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60.1445 0.507307L0.271179 33.1313L60.1525 65.79L120.021 33.1313L60.1445 0.507307Z"
        fill={theme.palette.rice.main}
      />
      <path
        d="M60.1472 21.7833L39.3005 33.1446L60.1472 44.514L80.9992 33.1446L60.1472 21.7833Z"
        fill={theme.palette.filling.main}
      />
      <path
        d="M60.2018 65.7899L0.329834 33.1312V117.249L60.1978 149.907L120.07 117.249V33.1312L60.2018 65.7899Z"
        fill={theme.palette.seaweed.main}
        stroke={theme.palette.rice.main}
        strokeWidth={1}
      />
    </SvgIcon>
  );
}
