"use client"
import React, { useEffect, useState } from "react";
import { Controller } from "./types";
import { Checkbox, Input, InputNumber, Radio, Switch } from "antd";
import { RadioGroup } from "@headlessui/react";

type Props = {
  id: string;
  controllers?: Controller[];
}

type ControlPanelState = { [label: string]: unknown };

const ControlPanel: React.FC<Props> = ({ id, controllers = [] }) => {
  const [values, setValues] = useState<ControlPanelState>({});

  useEffect(() => {
    const values: ControlPanelState = {};
    controllers.forEach(c => values[c.label] = c.default);
    setValues(values);
  }, [controllers]);

  return (<div>
    {controllers.map(c => {
      return c.type === "boolean"
        ? <Switch id={`id-${c.label}`} defaultChecked={c.default} onChange={c.callback} />
        : c.type === "number"
          ? <InputNumber id={`id=${c.label}`} min={c.range[0]} max={c.range[1]} defaultValue={c.default} onChange={c.callback} />
          : c.type === "radio"
            ? <RadioGroup id={`id=${c.label}`} value={c.default} onChange={c.callback}>
              {c.options.map(option => (
                <Radio key={option.label} value={option.value}>{option.label}</Radio>
              ))}
            </RadioGroup>
            : c.type === "checkbox"
              ? <Checkbox.Group
                options={c.options}
                defaultValue={c.default}
                onChange={c.callback as any} />
              : null
    })}
  </div>);
}
export default ControlPanel;
