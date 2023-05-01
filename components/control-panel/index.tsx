"use client"
import React, { useEffect, useState } from "react";
import { Controller } from "./types";
import { Checkbox, Input, InputNumber, Radio, Slider, Switch } from "antd";
import { RadioGroup } from "@headlessui/react";
import classNames from "classnames";

type Props = {
  id?: string;
  className?: string;
  controllers?: Controller[];
}

type ControlPanelState = { [label: string]: unknown };

const ControlPanel: React.FC<Props> = ({ id, className, controllers = [] }) => {
  const [values, setValues] = useState<ControlPanelState>({});
  console.log("change", controllers);

  useEffect(() => {
    const values: ControlPanelState = {};
    controllers.forEach(c => values[c.label] = c.default);
    setValues(values);
  }, [controllers]);

  return (<div className={classNames("w-full", className)}>
    {controllers.map(c => {
      return (<div key={c.label} className="flex justify-center align-middle">
        <label htmlFor={`id-${c.label}`} className="text-center align-middle h-full m-2">{c.label}</label>
        {c.type === "boolean"
          ? <Switch id={`id-${c.label}`} className="w-full" defaultChecked={c.default} onChange={c.callback} />
          : c.type === "number"
            ? <Slider id={`id-${c.label}`} className="w-full" min={c.range[0]} max={c.range[1]} step={c.step||0.1} defaultValue={c.default} onChange={c.callback} />
            : c.type === "radio"
              ? <RadioGroup id={`id-${c.label}`} className="w-full" value={c.default} onChange={c.callback}>
                {c.options.map(option => (
                  <Radio key={option.label} className="w-full" value={option.value}>{option.label}</Radio>
                ))}
              </RadioGroup>
              : c.type === "checkbox"
                ? <Checkbox.Group
                  options={c.options}
                  defaultValue={c.default}
                  onChange={c.callback as any} />
                : null}
      </div>)
    })}
  </div>);
}
export default ControlPanel;
