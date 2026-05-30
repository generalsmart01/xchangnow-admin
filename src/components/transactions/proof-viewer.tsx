"use client";

import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { explorerName, explorerTxUrl } from "@/lib/explorer";
import type { Network, TransactionProof } from "@/lib/types/transaction";

function CryptoHashProof({
  proof,
  network,
}: {
  proof: TransactionProof;
  network: Network;
}) {
  const url = explorerTxUrl(network, proof.url);
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
            View on {explorerName(network)}
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
        Bank transfer receipt
      </div>
      <a href={proof.url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proof.url}
          alt="Bank transfer receipt"
          className="max-h-96 w-full rounded-md border object-contain"
        />
      </a>
      {proof.notes ? (
        <p className="text-xs text-muted-foreground">{proof.notes}</p>
      ) : null}
    </div>
  );
}

export function ProofViewer({
  proofs,
  network,
}: {
  proofs: TransactionProof[] | undefined;
  network: Network;
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
      {proofs.map((proof) =>
        proof.type === "CRYPTO_TX_HASH" ? (
          <CryptoHashProof key={proof.id} proof={proof} network={network} />
        ) : (
          <ReceiptProof key={proof.id} proof={proof} />
        ),
      )}
    </div>
  );
}
