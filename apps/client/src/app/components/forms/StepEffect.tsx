import { StepEffectSchema, stepEffectSchema } from "@ledroom2/validations";
import { ChromePicker, ColorResult } from "react-color";

import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";
import { ClientStepEffect } from "../../types/effect";
import { useStore } from "../../store/store";

interface Props extends ClientStepEffect {}

const colorPickerStyle = {
  default: {
    picker: { boxShadow: "none" },
    color: { display: "none" },
    swatch: { display: "none" },
    active: { display: "none" },
    body: { padding: "0" },
  },
};

export const StepEffectForm: FC<Props> = (props) => {
  const updateStepEffect = useStore.use.updateStepEffect();

  const [ledColors, setLedColors] = useState(props.ledColors);
  const [barColor, setBarColor] = useState(props.barColor);
  const [clipColor, setClipColor] = useState(props.clipColor);

  const effect = useStore((state) => {
    const song = state.songs.find((song) => song.id === state.selectedSongId);
    if (!song) {
      return null;
    }
    const effect = state.effects.find(
      (effect) =>
        effect.regionId === song.selectedRegionId && effect.type === "step"
    );
    if (!effect) {
      return null;
    }
    return effect;
  });

  if (!effect) {
    return null;
  }
  console.log(effect);

  const { barCount, speed, direction, rangeStart, rangeEnd } = effect;

  // LEDCOLORS CHANGE
  const onLedColorsChange = useCallback((color: ColorResult) => {
    setLedColors(color.rgb);
  }, []);

  const onLedColorsChangeComplete = useCallback((color: ColorResult) => {
    updateStepEffect({ ledColors: color.rgb });
  }, []);

  // BARCOLORS CHANGE
  const onBarColorChange = useCallback((color: ColorResult) => {
    setBarColor(color.rgb);
  }, []);

  const onBarColorChangeComplete = useCallback((color: ColorResult) => {
    updateStepEffect({ barColor: color.rgb });
  }, []);

  // CLIPCOLORS CHANGE
  const onClipColorChange = useCallback((color: ColorResult) => {
    setClipColor(color.rgb);
  }, []);

  const onClipColorChangeComplete = useCallback((color: ColorResult) => {
    updateStepEffect({ clipColor: color.rgb });
  }, []);

  // BARCOUNT CHANGE
  const onBarCountChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const barCount = parseInt(event.target.value);
      updateStepEffect({ barCount });
    },
    []
  );

  // SPEED CHANGE
  const onSpeedChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(event.target.value);
    updateStepEffect({ speed });
  }, []);

  // RANGESTART CHANGE
  const onRangeStartChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const rangeStart = parseInt(event.target.value);
      updateStepEffect({ rangeStart });
    },
    []
  );

  // RANGEEND CHANGE
  const onRangeEndChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const rangeEnd = parseInt(event.target.value);
      updateStepEffect({ rangeEnd });
    },
    []
  );

  // DIRECTION CHANGE
  const onDirectionChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const direction = event.target.value as "left" | "right";
      updateStepEffect({ direction });
    },
    []
  );

  // SELECT VALUES
  const speedOptions = useMemo(() => {
    return new Array(37).fill(0).map((_, index) => {
      const value = 1 + index * 0.25;
      return (
        <option key={value} value={value}>
          {value}
        </option>
      );
    });
  }, []);

  const barCountOptions = useMemo(() => {
    return new Array(826).fill(0).map((_, index) => {
      const value = index + 1;
      return (
        <option key={value} value={value}>
          {value}
        </option>
      );
    });
  }, []);

  const rangeStartOptions = useMemo(() => {
    const options = [];

    for (let i = 0; i < rangeEnd - 1; i++) {
      const value = i + 1;
      options.push(
        <option key={value} value={value}>
          {value}
        </option>
      );
    }

    return options;
  }, [rangeEnd]);

  const rangeEndOptions = useMemo(() => {
    const options = [];

    for (let i = rangeStart; i < 826; i++) {
      const value = i + 1;
      options.push(
        <option key={value} value={value}>
          {value}
        </option>
      );
    }

    return options;
  }, [rangeStart]);

  return (
    <div className="flex">
      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="ledcolors"
        >
          ledcolors
        </label>
        <ChromePicker
          styles={colorPickerStyle}
          onChange={onLedColorsChange}
          onChangeComplete={onLedColorsChangeComplete}
          color={ledColors}
        ></ChromePicker>
      </div>

      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="barColor"
        >
          barcolor
        </label>
        <ChromePicker
          styles={colorPickerStyle}
          onChange={onBarColorChange}
          onChangeComplete={onBarColorChangeComplete}
          color={barColor}
        ></ChromePicker>
      </div>

      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="barColor"
        >
          clipcolor
        </label>
        <ChromePicker
          styles={colorPickerStyle}
          onChange={onClipColorChange}
          onChangeComplete={onClipColorChangeComplete}
          color={clipColor}
        ></ChromePicker>
      </div>

      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="speed"
        >
          speed
        </label>
        <select name="speed" id="speed" value={speed} onChange={onSpeedChange}>
          {speedOptions}
        </select>
      </div>

      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="barCount"
        >
          barcount
        </label>
        <select
          name="barCount"
          id="barCount"
          value={barCount}
          onChange={onBarCountChange}
        >
          {barCountOptions}
        </select>
      </div>

      <div className="mr-5">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="direction"
        >
          direction
        </label>
        <select
          name="direction"
          id="direction"
          value={direction}
          onChange={onDirectionChange}
        >
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
      </div>

      <div className="mr-5 w-40">
        <label
          className="block text-gray-700 text-sm font-bold mb-2 uppercase"
          htmlFor="direction"
        >
          range
        </label>
        <div className="flex ">
          <div className="w-full">
            <label
              className="block text-gray-700 text-sm mb-2"
              htmlFor="rangeStart"
            >
              start
            </label>
            <select
              name="rangeStart"
              id="rangeStart"
              value={rangeStart}
              onChange={onRangeStartChange}
            >
              {rangeStartOptions}
            </select>
          </div>
          <div className="w-full">
            <label
              className="block text-gray-700 text-sm mb-2"
              htmlFor="rangeEnd"
            >
              end
            </label>
            <select
              name="rangeEnd"
              id="rangeEnd"
              value={rangeEnd}
              onChange={onRangeEndChange}
            >
              {rangeEndOptions}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
