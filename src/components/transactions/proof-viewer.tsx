"use client";

import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { ImagePreview } from "@/components/shared/image-preview";
import { explorerName, explorerTxUrl } from "@/lib/explorer";
import { isImageUrl } from "@/lib/media";
import { smartLabel } from "@/lib/labels";
import type { TransactionProof } from "@/lib/types/transaction";

type ExplorerInfo = {
  /** Network code, e.g. "ETHEREUM". */
  code?: string | null;
  /** Optional explorer URL template carrying a {txHash} placeholder. */
  template?: string | null;
};

function CryptoHashProof({
  proof,
  explorer,
}: {
  proof: TransactionProof;
  explorer: ExplorerInfo;
}) {
  const url = explorerTxUrl({ code: explorer.code, template: explorer.template, hash: proof.url });
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="size-4 text-muted-foreground" />
        Crypto transaction hash
      </div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 font-mono text-xs">
          {proof.url}
        </code>
        <CopyButton value={proof.url} label="Tx hash" />
      </div>
      {url ? (
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            View on {explorerName(explorer.code)}
          </a>
        </Button>
      ) : null}
      {proof.notes ? (
        <p className="text-xs text-muted-foreground">{proof.notes}</p>
      ) : null}
    </div>
  );
}

function ReceiptProof({ proof }: { proof: TransactionProof }) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4 text-muted-foreground" />
        {proof.type === "BANK_TRANSFER_RECEIPT" ? "Bank transfer receipt" : "Attachment"}
      </div>
      <ImagePreview
        src={proof.url}
        alt="Proof attachment"
        imgClassName="max-h-96 w-full"
      />
      {proof.notes ? (
        <p className="text-xs text-muted-foreground">{proof.notes}</p>
      ) : null}
    </div>
  );
}

/** Non-image proof (e.g. an OTHER proof carrying an outbound tx hash). */
function GenericProof({ proof }: { proof: TransactionProof }) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="size-4 text-muted-foreground" />
        {smartLabel(proof.type)}
      </div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 font-mono text-xs">
          {proof.url}
        </code>
        <CopyButton value={proof.url} label="Value" />
      </div>
      {proof.notes ? (
        <p className="text-xs text-muted-foreground">{proof.notes}</p>
      ) : null}
    </div>
  );
}

export function ProofViewer({
  proofs,
  explorer = {},
}: {
  proofs: TransactionProof[] | undefined;
  explorer?: ExplorerInfo;
}) {
  if (!proofs || proofs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No proof submitted yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {proofs.map((proof) => {
        if (proof.type === "CRYPTO_TX_HASH") {
          return <CryptoHashProof key={proof.id} proof={proof} explorer={explorer} />;
        }
        // Only render as an image when the value is actually an image URL —
        // an OTHER proof may carry an outbound tx hash, not a Cloudinary URL.
        return isImageUrl(proof.url) ? (
          <ReceiptProof key={proof.id} proof={proof} />
        ) : (
          <GenericProof key={proof.id} proof={proof} />
        );
      })}
    </div>
  );
}
