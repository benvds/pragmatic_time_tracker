# NOTES

## Form implementation

Commit: 93af4fc6f35a5a5df15b0d4b2253dfbe50d226f2

The `Fields` generic resolves to a map where all the `Field` types are of
unknown type.

```
   20   type EntryFields = Fields<EntryFieldName>;                                                                                                           
    1            ╭────────────────────────────────╮                                                                                                          
    2   const des│type EntryFields = {            │                                                                                                          
    3   const pro│    description: Field<unknown>;│                                                                                                          
    4   const hhM│    project: Field<unknown>;    │                                                                                                          
    5   const hhM│    hh: Field<unknown>;         │                                                                                                          
    6   const mmM│    mm: Field<unknown>;         │                                                                                                          
    7   const mmM│}                               │                                                                                                          
    8            ╰────────────────────────────────╯     
```

Typings are lost after parsed and everyField ok, therefore we need to cast the
values to their types again. this could be inferred from the original type.

```typescript
const {fields, reset, setField, setFields} = useForm<EntryFields>({ parsers: fieldParsers });

const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();

    const parsed = setFields(evt);

    if (everyFieldOk(parsed)) {
        const entry = {
            description: (parsed.description as OkField<string>).value,
            project: (parsed.project as OkField<string>).value,
            duration:
                (parsed.hh as OkField<number>).value * 60 +
                (parsed.mm as OkField<number>).value,
        };

        console.debug("entry", entry);
    }
};

```
