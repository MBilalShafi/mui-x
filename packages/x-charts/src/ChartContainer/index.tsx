import * as React from 'react';
import { DrawingProvider, DrawingProviderProps } from '../context/DrawingProvider';
import {
  SeriesContextProvider,
  SeriesContextProviderProps,
} from '../context/SeriesContextProvider';
import { InteractionProvider } from '../context/InteractionProvider';
import { Surface, SurfaceProps } from '../Surface';
import {
  CartesianContextProvider,
  CartesianContextProviderProps,
} from '../context/CartesianContextProvider';

export type ChartContainerProps = Omit<
  SurfaceProps &
    SeriesContextProviderProps &
    Omit<DrawingProviderProps, 'svgRef'> &
    CartesianContextProviderProps,
  'children'
> & { children?: React.ReactNode };

export function ChartContainer(props: ChartContainerProps) {
  const { width, height, series, margin, xAxis, yAxis, colors, sx, title, desc, children } = props;
  const ref = React.useRef<SVGSVGElement>(null);

  return (
    <DrawingProvider width={width} height={height} margin={margin} svgRef={ref}>
      <SeriesContextProvider series={series} colors={colors}>
        <CartesianContextProvider xAxis={xAxis} yAxis={yAxis}>
          <InteractionProvider>
            <Surface width={width} height={height} ref={ref} sx={sx} title={title} desc={desc}>
              {children}
            </Surface>
          </InteractionProvider>
        </CartesianContextProvider>
      </SeriesContextProvider>
    </DrawingProvider>
  );
}
