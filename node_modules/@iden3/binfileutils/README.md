# binutils

Utility to work with binary files

## Format

4 bytes  => file type
uint32   => Version
uint32   => Number of secionsi

..For each section

uint32  => sectionType
uint64  => sectionBodySize
bytes   => sectionBody


