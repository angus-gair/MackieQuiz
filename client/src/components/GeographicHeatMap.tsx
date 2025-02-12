import { memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const colorScale = scaleLinear<string>()
  .domain([0, 5, 20, 50])
  .range(["#C8E6C9", "#81C784", "#4CAF50", "#2E7D32"]);

type GeoData = {
  country: string;
  count: number;
}[];

export const GeographicHeatMap = memo(({ data }: { data: GeoData }) => {
  return (
    <div className="w-full h-full">
      <ComposableMap
        projectionConfig={{
          scale: 147
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryData = data.find(d => d.country === geo.properties.name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countryData ? colorScale(countryData.count) : "#EEE"}
                    stroke="#FFF"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: "none"
                      },
                      hover: {
                        fill: countryData ? colorScale(countryData.count + 5) : "#DDD",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
});

GeographicHeatMap.displayName = "GeographicHeatMap";
