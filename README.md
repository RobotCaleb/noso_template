[![rm1](https://img.shields.io/badge/rM1-supported-green)](https://remarkable.com/store/remarkable)
[![rm2](https://img.shields.io/badge/rM2-supported-green)](https://remarkable.com/store/remarkable-2)
[![opkg](https://img.shields.io/badge/OPKG-template--noso--grid-blue)](https://toltec-dev.org/)

# noso template creator -- for reMarkable 2

This is a tool to create not-really-isometric drawing templates for the reMarkable 2 e-ink drawing tablet.

Not-really-isometric -- nosometric -- noso.

![Blank canvas](images/blank.png)
![Real art](images/realart.png)

It's not perfect and it breaks in some instances. But it built what I needed it to.

Play with it at https://robotcaleb.github.io/noso_template/

Tweak the sliders and click the "Save template" button.

---

Once downloaded, rename the `.png` and `.svg` and place on your device at `/usr/share/remarkable/templates/` and update the `templates.json` file. Recommend using `templatectl` - https://github.com/PeterGrace/templatectl
