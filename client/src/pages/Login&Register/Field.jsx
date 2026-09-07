import React from 'react'

function Field({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
}) {
  return (
    <input
    required
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full rounded-lg bg-[#F3F5F3] px-4 py-2.5 text-[13.5px] text-[#14233B] placeholder:text-[#8E938F] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-[#1F8A70]/25"
    />
  );
}

export default Field